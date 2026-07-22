import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';


import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivacyPolicy from './pages/term & policy/PrivacyPolicy';
import TermsAndConditions from './pages/term & policy/TermsAndConditions';


function App() {
  return (
    <div className=" ">
      <Navbar/>
    <PrivacyPolicy/>
    <TermsAndConditions/>
     <Footer/>
    </div>
  );
}

export default App;
