import heroImage from "@/assets/hero-image.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="column">
        <div style={{ height: "100vh", maxHeight: "1220px" }}>
          <div className="landing">
            {/* <video autoPlay loop muted playsInline className="background-video">
              <source src="/IMG_7068.MOV" type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}
          </div>
        </div>
        {/* <About />
              <Stats />
              <Guide /> */}
      </div>
      {/* Background Image */}
      {/*
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div> */}

      {/* Content */}
      <div className="absolute z-10 text-center text-white px-4">
        <div className="mb-8">
          <p className="text-sm md:text-base tracking-wider uppercase mb-4 opacity-90">
            2024/25
          </p>
          <h1 className="text-luxury mb-8">Ready to Wear</h1>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/men"
            className="btn-blvck-ghost min-w-[140px] group relative overflow-hidden"
          >
            <span className="relative z-10">MEN</span>
            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </Link>
          <Link
            to="/women"
            className="btn-blvck-ghost min-w-[140px] group relative overflow-hidden"
          >
            <span className="relative z-10">WOMEN</span>
            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70">
        <div className="flex flex-col items-center">
          <div className="w-px h-16 bg-white opacity-50 mb-4"></div>
          <p className="text-xs tracking-wider uppercase">Scroll</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
