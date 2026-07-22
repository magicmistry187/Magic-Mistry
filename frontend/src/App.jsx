import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import CreateAccountModal from './pages/auth/CreateAccountModal';
import WelcomeModal from './pages/auth/LoginPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';


function App() {
  return (
    <div className=" ">
      <Navbar/>
      <WelcomeModal/>
      <p>sksjhdjashd</p>
     <CreateAccountModal/>
     <Footer/>
    </div>
  );
}

export default App;
