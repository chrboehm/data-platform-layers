import React, {useState, useEffect, useCallback} from "react";
import ReactDOM from "react-dom/client";
import yaml from "js-yaml";

const CONFIG = {
    enabledVersions: ["a", "b", "c", "d"],
    defaultVersion: "a",
};

function ToolNode({tool}) {
    return (
        <li className="ml-8 pl-4 border-l-2 border-gray-300">
            <a href={tool.link} target="_blank" rel="noopener noreferrer"
               className="inline-block text-base text-blue-800 font-medium hover:underline py-2">
                🔧 {tool.name}
            </a>
            {tool.description && (
                <div className="text-sm text-gray-600 italic ml-6">{tool.description}</div>
            )}
        </li>
    );
}

function TreeNode({node, version, allExpanded, onNodeToggle}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(allExpanded);
    }, [allExpanded]);

    const isToolList = node.category !== undefined;
    const hasChildren = node.children && node.children.length > 0;

    if (isToolList) {
        return node.category === version ? <ToolNode tool={node}/> : null;
    }

    const handleClick = () => {
        if (hasChildren) {
            setOpen(!open);
            onNodeToggle();
        }
    };

    return (
        <li className="ml-4">
            <div
                className={`cursor-pointer font-medium text-gray-700 hover:text-blue-600 flex items-center gap-2 ${
                    hasChildren ? "" : "cursor-default"
                }`}
                onClick={handleClick}
            >
                <span>{open && hasChildren ? "▼" : hasChildren ? "▶" : ""}</span>
                <span>
     {node.name}
                    {node.description && (
                        <span className="ml-2 text-sm text-gray-500 italic">
       ({node.description})
      </span>
                    )}
    </span>
            </div>
            {open && hasChildren && (
                <ul className="pl-4 mt-1 space-y-1">
                    {node.children.map((child, idx) => (
                        <TreeNode key={idx} node={child} version={version} allExpanded={allExpanded}
                                  onNodeToggle={onNodeToggle}/>
                    ))}
                </ul>
            )}
        </li>
    );
}

function FeedbackButton() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetch("/api/feedback")
        .then(res => res.json())
        .then(data => setCount(data.count));
    }, []);

    const handleClick = () => {
        fetch("/api/feedback", {method: "POST"})
        .then(res => res.json())
        .then(data => setCount(data.count));
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white border shadow-md p-3 rounded-md text-sm">
            <button
                onClick={handleClick}
                className="text-emerald-700 hover:text-emerald-900 font-medium"
            >
                👍 Was this helpful? [{count}]
            </button>
        </div>
    );
}

function App() {
    const [treeData, setTreeData] = useState([]);
    const [activeVersion, setActiveVersion] = useState(CONFIG.defaultVersion);
    const [allExpanded, setAllExpanded] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data.yaml`)
        .then((res) => res.text())
        .then((txt) => setTreeData(yaml.load(txt)));
    }, []);

    const versionLabels = {
        a: "Open Source",
        b: "AWS",
        c: "GCP",
        d: "Azure",
    };

    const toggleAllExpanded = useCallback(() => {
        setAllExpanded(!allExpanded);
    }, [allExpanded]);

    return (
        <div>
            {/*<div className="mb-6 flex flex-wrap gap-2 justify-center">*/}
            {/*    {CONFIG.enabledVersions.map((v) => (*/}
            {/*        <button*/}
            {/*            key={v}*/}
            {/*            className={`px-4 py-1.5 rounded-full border transition-colors duration-200 ${*/}
            {/*                activeVersion === v*/}
            {/*                    ? "bg-blue-600 text-white border-blue-600"*/}
            {/*                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"*/}
            {/*            }`}*/}
            {/*            onClick={() => setActiveVersion(v)}*/}
            {/*        >*/}
            {/*            {versionLabels[v]}*/}
            {/*        </button>*/}
            {/*    ))}*/}
            {/*</div>*/}
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
                <button
                    className="px-4 py-1.5 rounded-full border transition-colors duration-200 bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    onClick={toggleAllExpanded}
                >
                    {allExpanded ? "Collapse All" : "Expand All"}
                </button>
            </div>
            <ul className="text-sm space-y-2">
                {treeData.map((node, idx) => (
                    <TreeNode key={idx} node={node} version={activeVersion} allExpanded={allExpanded}
                              onNodeToggle={() => {
                              }}/>
                ))}
            </ul>
            {/*<FeedbackButton/>*/}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);