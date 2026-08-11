const fs = require('fs');
const html = fs.readFileSync('Figma/S Kumaran Tailor Web.html', 'utf8');
const scriptStartIndex = html.indexOf('<script>');
const scriptEndIndex = html.indexOf('</script>', scriptStartIndex);

if (scriptStartIndex !== -1 && scriptEndIndex !== -1) {
    const scriptContent = html.substring(scriptStartIndex + 8, scriptEndIndex);
    // Find where the login markup is rendered
    const match = scriptContent.match(/login.*?`/i);
    if (match) {
        console.log("Found login in script:", scriptContent.substring(match.index, match.index + 2000));
    } else {
        console.log("Could not find login logic in script.");
    }
}
