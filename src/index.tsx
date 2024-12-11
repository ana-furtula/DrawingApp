import ReactDOM from "react-dom/client";
import "./css/index.css";
import Editor from "./components/Editor";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<Editor imageUrl="../example-image1.jpg" />);
