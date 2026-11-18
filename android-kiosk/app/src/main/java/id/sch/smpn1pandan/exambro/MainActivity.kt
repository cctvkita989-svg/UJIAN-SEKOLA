package id.sch.smpn1pandan.exambro

import android.Manifest
import android.annotation.SuppressLint
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.InputType
import android.view.ActionMode
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {

    companion object {
        private const val EXAM_URL = "https://ujian-sekola.vercel.app/"
        private const val PROCTOR_EXIT_PIN = "123456"
    }

    private lateinit var webView: WebView
    private lateinit var pinningOverlay: LinearLayout
    private lateinit var tvPinStatus: TextView
    private lateinit var tvPinOverlayDesc: TextView

    private var isProctorUnlocked = false
    private var hasAttemptedAutoPin = false
    private var wasDevicePinned = false
    @Volatile
    private var isExamActive = false
    private var examStartedAtMs = 0L
    private var pendingAudioPermissionRequest: PermissionRequest? = null

    private val handler = Handler(Looper.getMainLooper())
    private val pinCheckRunnable = object : Runnable {
        override fun run() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInMultiWindowMode && isExamActive && !isProctorUnlocked) {
                finishExamInWeb("Membuka layar belah (Split Screen) saat ujian")
            }
            syncPinningUiState()
            handler.postDelayed(this, 750L)
        }
    }

    private val requestMicPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        val req = pendingAudioPermissionRequest
        pendingAudioPermissionRequest = null
        if (req != null) {
            if (granted) {
                req.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
            } else {
                req.deny()
            }
        }
    }

    inner class KioskBridge {
        @JavascriptInterface
        fun setExamActive(active: Boolean) {
            runOnUiThread {
                isExamActive = active
                if (active) {
                    examStartedAtMs = System.currentTimeMillis()
                    if (isDevicePinned()) {
                        wasDevicePinned = true
                    } else {
                        triggerScreenPinning()
                    }
                } else {
                    examStartedAtMs = 0L
                }
                syncPinningUiState()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. Block screenshots, screen recording, and recent-apps preview thumbnail
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        hideSystemBars()

        webView = findViewById(R.id.examWebView)
        pinningOverlay = findViewById(R.id.pinningOverlay)
        tvPinStatus = findViewById(R.id.tvPinStatus)
        tvPinOverlayDesc = findViewById(R.id.tvPinOverlayDesc)

        val btnRefreshWeb: Button = findViewById(R.id.btnRefreshWeb)
        val btnProctorExit: Button = findViewById(R.id.btnProctorExit)
        val btnActivatePinning: Button = findViewById(R.id.btnActivatePinning)
        val btnOpenPinSettings: Button = findViewById(R.id.btnOpenPinSettings)
        val btnOverlayProctorBypass: Button = findViewById(R.id.btnOverlayProctorBypass)

        setupProtectedWebView()

        btnRefreshWeb.setOnClickListener {
            webView.reload()
        }

        btnProctorExit.setOnClickListener {
            showProctorPinDialog()
        }

        btnActivatePinning.setOnClickListener {
            triggerScreenPinning()
        }

        btnOpenPinSettings.setOnClickListener {
            try {
                startActivity(Intent(Settings.ACTION_SECURITY_SETTINGS))
            } catch (_: Exception) {
                startActivity(Intent(Settings.ACTION_SETTINGS))
            }
        }

        btnOverlayProctorBypass.setOnClickListener {
            showProctorPinDialog()
        }

        // Disable hardware/gesture Back button escape
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                Toast.makeText(
                    this@MainActivity,
                    "Tombol Kembali dinonaktifkan selama ujian. Gunakan tombol Keluar (PIN Pengawas).",
                    Toast.LENGTH_SHORT
                ).show()
            }
        })

        webView.loadUrl(EXAM_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupProtectedWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            allowFileAccess = false
            allowContentAccess = false
            userAgentString = "$userAgentString ExambroKiosk/1.0"
        }

        webView.addJavascriptInterface(KioskBridge(), "AndroidKiosk")

        // Disable long press copy/paste/context popup in WebView
        webView.isLongClickable = false
        webView.isHapticFeedbackEnabled = false
        webView.setOnLongClickListener { true }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val uri = request?.url ?: return false
                val host = uri.host?.lowercase() ?: return true

                val isAllowed = host == "ujian-sekola.vercel.app" ||
                    host.endsWith(".vercel.app") ||
                    host.endsWith("firebaseapp.com") ||
                    host.endsWith("googleapis.com") ||
                    host.endsWith("gstatic.com")

                return if (isAllowed) {
                    false
                } else {
                    Toast.makeText(
                        this@MainActivity,
                        "Akses keluar domain ujian diblokir.",
                        Toast.LENGTH_SHORT
                    ).show()
                    true
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                if (request == null) return
                val wantsAudio = request.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                if (wantsAudio) {
                    val granted = ContextCompat.checkSelfPermission(
                        this@MainActivity,
                        Manifest.permission.RECORD_AUDIO
                    ) == PackageManager.PERMISSION_GRANTED

                    if (granted) {
                        request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
                    } else {
                        pendingAudioPermissionRequest = request
                        requestMicPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    }
                } else {
                    request.deny()
                }
            }
        }
    }

    private fun finishExamInWeb(reason: String) {
        if (!isExamActive) return
        isExamActive = false
        val safeReason = reason.replace("\\", "\\\\").replace("'", "\\'")
        runOnUiThread {
            try {
                webView.evaluateJavascript(
                    "window.__finishExamFromKiosk && window.__finishExamFromKiosk('$safeReason');",
                    null
                )
            } catch (_: Exception) {
            }
        }
    }

    // Block Android floating text selection toolbar (Copy / Paste / Web Search)
    override fun onActionModeStarted(mode: ActionMode?) {
        super.onActionModeStarted(mode)
        mode?.finish()
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (isExamActive && !isProctorUnlocked) {
            finishExamInWeb("Keluar dari aplikasi saat ujian berlangsung")
        }
    }

    override fun onStop() {
        super.onStop()
        if (isExamActive && !isProctorUnlocked) {
            finishExamInWeb("Aplikasi ditutup atau dipindah ke latar belakang saat ujian")
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemBars()
            if (!hasAttemptedAutoPin && !isProctorUnlocked) {
                hasAttemptedAutoPin = true
                handler.postDelayed({
                    try {
                        startLockTask()
                    } catch (_: Exception) {
                    }
                    syncPinningUiState()
                }, 400L)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInMultiWindowMode && isExamActive && !isProctorUnlocked) {
                finishExamInWeb("Membuka layar belah (Split Screen) saat ujian")
            }
            syncPinningUiState()
        }
    }

    override fun onResume() {
        super.onResume()
        hideSystemBars()
        syncPinningUiState()
        handler.removeCallbacks(pinCheckRunnable)
        handler.postDelayed(pinCheckRunnable, 750L)
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(pinCheckRunnable)
        if (isExamActive && !isProctorUnlocked && wasDevicePinned && !isDevicePinned()) {
            finishExamInWeb("Mencoba melepas mode sematkan (Pinning) saat ujian")
        }
    }

    private fun hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        controller.hide(WindowInsetsCompat.Type.systemBars())
    }

    private fun isDevicePinned(): Boolean {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        return am.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE
    }

    private fun triggerScreenPinning() {
        if (isDevicePinned()) {
            syncPinningUiState()
            return
        }
        try {
            startLockTask()
        } catch (_: Exception) {
            Toast.makeText(
                this,
                "Aktifkan fitur 'Sematkan Aplikasi (App Pinning)' di Pengaturan Keamanan HP.",
                Toast.LENGTH_LONG
            ).show()
        }
        handler.postDelayed({ syncPinningUiState() }, 600L)
    }

    private fun syncPinningUiState() {
        val pinned = isDevicePinned()
        val examNeedsPinning = isExamActive &&
            examStartedAtMs > 0L &&
            (System.currentTimeMillis() - examStartedAtMs) > 4500L

        if (pinned) {
            wasDevicePinned = true
            tvPinStatus.text = "PINNING AKTIF • ANTI-SCREENSHOT & ANTI-COPAS"
            tvPinStatus.setTextColor(0xFF34D399.toInt())
            pinningOverlay.visibility = View.GONE
        } else if (wasDevicePinned) {
            if (isExamActive && !isProctorUnlocked) {
                finishExamInWeb("Mencoba melepas mode sematkan (Pinning) saat ujian")
            }
            tvPinStatus.text = "PINNING DILEPAS • UJIAN SELESAI"
            tvPinStatus.setTextColor(0xFFFB7185.toInt())
            tvPinOverlayDesc.text = "Mode sematkan (Screen Pinning) dilepas atau tidak aktif.\n\nJika dilakukan saat ujian berlangsung, sesi ujian otomatis diselesaikan. Klik tombol di bawah untuk mengaktifkan kembali pinning."
            pinningOverlay.visibility = View.VISIBLE
        } else if (examNeedsPinning) {
            tvPinStatus.text = "WAJIB PINNING SAAT UJIAN"
            tvPinStatus.setTextColor(0xFFFB7185.toInt())
            tvPinOverlayDesc.text = "Untuk mengerjakan ujian, mode sematkan (Screen Pinning) wajib aktif. Klik tombol di bawah lalu pilih 'Mengerti / Ya' pada dialog sistem Android."
            pinningOverlay.visibility = View.VISIBLE
        } else {
            tvPinStatus.text = "CBT KIOSK SIAP • ANTI-SCREENSHOT"
            tvPinStatus.setTextColor(0xFF34D399.toInt())
            pinningOverlay.visibility = View.GONE
        }
    }

    private fun showProctorPinDialog() {
        val input = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_VARIATION_PASSWORD
            hint = "Masukkan PIN Pengawas"
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
            addView(input)
        }

        AlertDialog.Builder(this)
            .setTitle("Verifikasi PIN Pengawas")
            .setMessage("Masukkan PIN Pengawas untuk keluar dari aplikasi ujian. Jika siswa sedang mengerjakan ujian, sesi akan langsung diselesaikan.")
            .setView(container)
            .setPositiveButton("Keluar Aplikasi") { _, _ ->
                if (input.text.toString().trim() == PROCTOR_EXIT_PIN) {
                    val hadExam = isExamActive
                    if (hadExam) {
                        finishExamInWeb("Keluar aplikasi saat ujian berlangsung")
                    }
                    isProctorUnlocked = true
                    if (hadExam) {
                        handler.postDelayed({
                            try {
                                stopLockTask()
                            } catch (_: Exception) {
                            }
                            finishAndRemoveTask()
                        }, 350L)
                    } else {
                        try {
                            stopLockTask()
                        } catch (_: Exception) {
                        }
                        finishAndRemoveTask()
                    }
                } else {
                    Toast.makeText(this, "PIN Pengawas salah!", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}
