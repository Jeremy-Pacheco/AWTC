import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Volunteering from "./pages/Volunteering";
import Reviews from "./pages/Reviews";
import MoreInfo from "./pages/MoreInfo";
//TODO: Import other pages when you have them
function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Volunteering" element={<Volunteering />} />
        <Route path="/Reviews" element={<Reviews />} />
        <Route path="/MoreInfo" element={<MoreInfo />} />
        //TODO: Add other routes here when you have them
      </Routes>
    </BrowserRouter>
  );
}

export default App;
