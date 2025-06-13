import "./App.css";
import Editor from "./components/Editor";
import Titlebar from "./components/Titlebar";
import Breadcrumb from "./components/Breadcrumb";
import { useState } from "react";

function App() {
  const [currentPath, setCurrentPath] = useState("untitled.txt");

  const handlePathClick = (path: string) => {
    // TODO: Implement path navigation
    console.log("Path clicked:", path);
  };

  return (
    <main className="container">
      <Titlebar currentFileName={currentPath} />
      <div className="editor-container">
        <div className="editor-wrapper">
          <Breadcrumb path={currentPath} onPathClick={handlePathClick} />
          <Editor initialCode="console.log('Hello, world!');" language="typescript" theme="vs-dark" />
        </div>
      </div>
    </main>
  );
}

export default App;
