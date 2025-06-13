import "./App.css";
import { Editor } from "./components/Editor";
import Titlebar from "./components/Titlebar";
import Breadcrumb from "./components/Breadcrumb";
import { useState } from "react";

function App() {
  const [currentPath, setCurrentPath] = useState("untitled.txt");
  const [content, setContent] = useState("console.log('Hello, world!');");

  const handlePathClick = (path: string) => {
    // TODO: Implement path navigation
    console.log("Path clicked:", path);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  return (
    <main className="container">
      <Titlebar currentFileName={currentPath} />
      <div className="editor-container">
        <div className="editor-wrapper">
          <Breadcrumb path={currentPath} onPathClick={handlePathClick} />
          <Editor 
            content={content}
            onChange={handleContentChange}
            path={currentPath}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
