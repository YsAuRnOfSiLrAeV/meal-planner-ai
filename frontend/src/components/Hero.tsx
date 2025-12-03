"use client"
import { useEffect, useState } from "react";
import { hero }from '../assets';

function Hero() {
  const [isMobileTablet, setIsMobileTablet] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? (window.innerWidth >= 768 && window.innerWidth < 1024) : false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileTablet(width < 1024);
      setIsTablet(width >= 768 && width < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPhone = isMobileTablet && !isTablet;

  const content = (
    <>
      <h1 className={`${isPhone ? 'text-4xl' : 'md:text-5xl text-5xl'} font-extrabold leading-tight text-[#1F2A37]`}>
        Personalized meal plans in a minute
      </h1>
      <p className={`${isPhone ? 'mt-4 text-base' : 'mt-6 md:text-lg'} text-[#4B5563]`}>
        AI Meal Planner creates personalized nutrition plans based on your goals, allergies, and favorite cuisines. In a minute, you’ll get a balanced 8‑week menu with simple recipes and clear portions, tailored to your lifestyle.
      </p>
      <p className={`${isPhone ? 'mt-4 text-base' : 'mt-6 md:text-lg'} text-[#4B5563] font-bold`}>
        Enter your goals, allergies, and budget - we’ll generate a balanced plan with recipes and a shopping list.
      </p>
      <div className={`${isTablet ? 'mt-8 grid grid-cols-2 gap-4' : 'mt-6 flex flex-col sm:flex-row gap-3'}`}>
        <a href="/generate" className={`${isTablet ? 'w-full inline-flex justify-center items-center px-6 py-5 text-lg rounded-lg' : 'inline-flex justify-center items-center px-6 py-3 rounded-md'} bg-[#3A6EA5] text-white font-semibold shadow-sm hover:bg-[#5188c3] transition`}>
          Generate
        </a>
        <a href="#about" className={`${isTablet ? 'w-full inline-flex justify-center items-center px-6 py-5 text-lg rounded-lg' : 'inline-flex justify-center items-center px-6 py-3 rounded-md'} bg-[#fcfaf4] text-[#1F2A37] font-semibold border border-[#ebe8e5] hover:bg-[#e5e1d9] transition`}>
          Learn more
        </a>
      </div>
    </>
  );

  if (isMobileTablet) {
    return (
      <section className="relative w-full h-screen" id="home">
        <div className="flex-1 px-6 pt-16 md:pt-10 pb-8 text-center">
          {content}
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden" id="home">
      <div 
        className="hidden lg:block absolute right-0 top-0 lg:w-[38%] xl:w-[34%] xl:right-[4%] h-full bg-contain bg-right bg-no-repeat opacity-70"
        style={{ backgroundImage: `url(${hero.src})` }}
      />
      <div className="lg:w-[60%] xl:w-[55%] h-full flex items-center">
        <div className="md:pl-12 lg:pl-16 xl:pl-40 px-6">
          {content}
        </div>
      </div>
    </section>
  );
}

export default Hero;
