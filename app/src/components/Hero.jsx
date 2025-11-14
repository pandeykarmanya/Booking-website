import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero() {
  const slides = [
    {
      image: "/images/Dronacharya-Auditorium.jpg",
      title: "Dronacharya Auditorium",
      subtitle: "Book the perfect venue for grand events and seminars.",
    },
    {
      image: "/images/chanakya-auditorium.jpeg",
      title: "Chanakya Auditorium",
      subtitle: "Modern design with spacious seating and great acoustics.",
    },
    {
      image: "/images/seminar-hall-1.jpg",
      title: "Seminar Hall 1",
      subtitle: "Ideal for professional sessions and presentations.",
    },
    {
      image: "/images/seminar-hall-2.jpg",
      title: "Seminar Hall 2",
      subtitle: "Comfortable and tech-enabled seminar space.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto change images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Handlers for buttons
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative mt-28 w-full flex flex-col items-center">
      {/* Image Container */}
      <div className="relative w-full max-w-6xl h-[70vh] rounded-3xl overflow-hidden shadow-lg group">
        {/* Image */}
        <img
          src={slides[currentIndex].image}
          alt="Auditorium"
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />

        {/* Overlay (darken for text visibility) */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Text Overlay (bottom-left) */}
        <div className="absolute bottom-10 left-10 text-white">
          <h2 className="text-3xl md:text-4xl font-bold drop-shadow-md mb-2">
            {slides[currentIndex].title}
          </h2>
          <p className="text-base md:text-lg max-w-md opacity-90">
            {slides[currentIndex].subtitle}
          </p>
        </div>

        {/* Left Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-black p-3 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-black p-3 rounded-full transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-gray-300/70 hover:bg-white/70"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Book Now Button */}
      <button className="mt-6 px-8 py-3 bg-[#9a031e] text-white rounded-full text-lg font-semibold hover:bg-[#7a0217] transition">
        Book Now
      </button>
    </section>
  );
}
