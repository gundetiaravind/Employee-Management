
import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import "../styles/public.css";

export default function PublicLayout() {
  return (
    <>
      <Header />
      <Home />
      <Footer />
    </>
  );
}
