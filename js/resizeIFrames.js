// new version by Gemini in 2025
(function() {
    // Track which iframes use postMessage for resizing
    const postMessageIframes = new Set();
    
    function resizeIframe(iframe) {
        // Skip iframes that use postMessage for resizing
        if (postMessageIframes.has(iframe)) {
            return;
        }
        
        try {
            // Access the iframe's document
            // Note: This only works for Same-Origin iframes
            const doc = iframe.contentWindow.document;
            const body = doc.body;

            // 1. Get the full height of the content (including hidden overflow)
            const contentHeight = body.scrollHeight;

            // 2. Get the computed vertical margins (removes the need for the +32 magic number)
            const style = iframe.contentWindow.getComputedStyle(body);
            const marginTop = parseInt(style.marginTop) || 0;
            const marginBottom = parseInt(style.marginBottom) || 0;

            // 3. Set height (Content + Margins + small buffer for borders)
            iframe.style.height = (contentHeight + marginTop + marginBottom + 4) + "px";
            
        } catch (e) {
            console.warn("Could not resize iframe (likely Cross-Origin restriction).");
            // 1. Set a fixed height that is large enough to be useful (e.g., 80vh or 600px)
            iframe.style.height = "600px"; 
            
            // 2. Force the vertical scrollbar to appear
            // "auto" means it appears only if content overflows (cleaner)
            // "scroll" means the scrollbar track is always visible (explicit)
            iframe.style.overflowY = "auto"; 
            
            // 3. Fallback for older browsers or HTML overrides
            // This ensures attributes like scrolling="no" in the HTML are ignored
            iframe.setAttribute("scrolling", "yes");        }
    }

    // Run setup when the main DOM is ready
    document.addEventListener("DOMContentLoaded", function() {
        const frames = document.querySelectorAll("iframe");
        
        frames.forEach(frame => {
            // Resize this specific iframe as soon as it loads
            frame.addEventListener("load", () => resizeIframe(frame));
            
            // Attempt to resize immediately (in case it's already cached/loaded)
            resizeIframe(frame);
        });
    });

    // Handle browser window resizing
    window.addEventListener("resize", function() {
        document.querySelectorAll("iframe").forEach(resizeIframe);
    });
    
    // Handle postMessage from cross-origin iframes for dynamic resizing
    window.addEventListener("message", function(event) {
        // Check if this is a resize message
        if (event.data && event.data.type === 'resize' && typeof event.data.height === 'number') {
            // Find the iframe that sent this message
            const iframes = document.querySelectorAll("iframe");
            for (let iframe of iframes) {
                if (iframe.contentWindow === event.source) {
                    // Mark this iframe as using postMessage
                    postMessageIframes.add(iframe);
                    // Set the iframe height to the reported height
                    iframe.style.height = event.data.height + "px";
                    break;
                }
            }
        }
    });
})();
