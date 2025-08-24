// Componentes da aplicação
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Clinicas from './components/Clinicas/Clinicas';
import Aplicativos from './components/Aplicativos/Aplicativos';
import Chatbots from './components/Chatbots/Chatbots';
import Footer from './components/Footer/Footer';
// import ChatbotModal from "./components/ChatbotModal";

function App() {
  return (
    <div className="min-h-screen">

      <Header />
      <main>
        <Hero />
        <Clinicas />
        <Aplicativos />
        <Chatbots />
      </main>
      <Footer />

      {/* <ChatbotModal /> */}

    </div>
  );
}

export default App;
