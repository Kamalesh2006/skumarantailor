const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove isDesktop from the bottom where it was inserted incorrectly
code = code.replace(
    '    const isDesktop = useIsDesktop();\n    return (\n        <div className="flex h-screen w-full overflow-hidden bg-figma-bg text-figma-dark font-sans">',
    '    return (\n        <div className="flex h-screen w-full overflow-hidden bg-figma-bg text-figma-dark font-sans">'
);

// Add isDesktop at the top of the component
code = code.replace(
    '    const { t } = useLanguage();\n\n\n    const [currentTab, setCurrentTab] = useState<Tab>(activeTab);',
    '    const { t } = useLanguage();\n    const isDesktop = useIsDesktop();\n\n    const [currentTab, setCurrentTab] = useState<Tab>(activeTab);'
);

fs.writeFileSync(file, code);
console.log("Hooks fixed!");
