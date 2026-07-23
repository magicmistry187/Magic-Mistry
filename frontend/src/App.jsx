import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';


import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DispatchDataPassing from './example data passing/DispatchDataPassing';
import UserDataTablePassing from './example data passing/UserDataTablePassing';


function App() {
  return (
    <div className=" ">
      <Navbar/>
      <UserDataTablePassing/>
      <DispatchDataPassing/>
     <Footer/>
    </div>
  );
}

export default App;
