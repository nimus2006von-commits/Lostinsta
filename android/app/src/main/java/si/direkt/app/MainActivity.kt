package si.direkt.app

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import java.net.URI

private const val START_URL = "https://www.instagram.com/direct/inbox"
private const val FALLBACK_URL = "https://www.instagram.com/direct/inbox"

class MainActivity : Activity() {

    private lateinit var web: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        web = WebView(this)
        setContentView(web)

        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.databaseEnabled = true
        web.settings.cacheMode = WebSettings.LOAD_DEFAULT
        web.settings.userAgentString =
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) " +
                "Chrome/124.0.0.0 Mobile Safari/537.36"

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true)

        web.webViewClient = DirektWebViewClient()

        if (savedInstanceState == null) {
            web.loadUrl(START_URL)
        } else {
            web.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) {
            web.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }
}

private fun isHome(url: URI): Boolean {
    if (!isInstagram(url)) return false
    val path = url.path ?: "/"
    return path == "/" || path == ""
}

private fun isBlocked(url: URI): Boolean {
    if (!isInstagram(url)) return false
    val path = url.path ?: ""
    return path.startsWith("/reel") || path.startsWith("/explore") || path.startsWith("/reels")
}

private fun isInstagram(url: URI): Boolean {
    val host = url.host ?: return false
    return host == "instagram.com" ||
        host == "www.instagram.com" ||
        host == "m.instagram.com" ||
        host.endsWith(".instagram.com")
}

private class DirektWebViewClient : WebViewClient() {

    override fun shouldOverrideUrlLoading(
        view: WebView,
        request: WebResourceRequest
    ): Boolean {
        val uri = runCatching { URI(request.url.toString()) }.getOrNull() ?: return false
        return if (isHome(uri) || isBlocked(uri)) {
            view.loadUrl(FALLBACK_URL)
            true
        } else {
            false
        }
    }

    override fun doUpdateVisitedHistory(view: WebView, url: String, isReload: Boolean) {
        val uri = runCatching { URI(url) }.getOrNull()
        if (uri != null && (isHome(uri) || isBlocked(uri)) && !url.startsWith(FALLBACK_URL)) {
            view.loadUrl(FALLBACK_URL)
            return
        }
        super.doUpdateVisitedHistory(view, url, isReload)
    }
}
