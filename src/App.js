import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import './App.css';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <>
    <div>
      <Toaster  position='top-center'></Toaster>
    </div>
    <Routes>
     <Route path='/' element={ <Home /> } />
     <Route path='/editor/:roomId' element={ <EditorPage /> } />
    </Routes>
    </>
  );
}

export default App;
