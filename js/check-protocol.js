/**
 * Check if the page is opened via the file:// protocol.
 * If so, alert the user and show a warning message on the page.
 */
function checkFileProtocol() {
    if (window.location.protocol === 'file:') {
        const msg = "ERROR: You are opening this file directly (file://). This workbook requires a web server (http:// or https://) to function correctly. Please use 'Live Server' or a similar tool.";
        
        // 1. Alert the user
        alert(msg);

        // 2. Add warning to UI
        const columns = document.querySelectorAll('.maincolumn');
        columns.forEach(col => {
            const div = document.createElement('div');
            div.style.backgroundColor = "#ffcccc";
            div.style.borderRadius = "10px";
            div.style.padding = "10px";
            div.style.border = "1px solid #ff9999";
            div.style.color = "#a00";
            div.style.marginBottom = "10px";
            div.style.fontWeight = "bold";
            div.textContent = msg;
            
            col.prepend(div);
        });
    }
}
checkFileProtocol();
