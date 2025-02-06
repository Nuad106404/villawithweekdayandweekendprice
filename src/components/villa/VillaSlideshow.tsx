import React, { useEffect, useCallback, useState, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Constants for better maintainability
const AUTOPLAY_INTERVAL = 5000;
const SWIPE_THRESHOLD = 100;
const MAX_SLIDES = 50; // Increased maximum slides to 50

interface SlideProps {
  url: string;
  alt: string;
  title: string;
  index: number;
  total: number;
  isActive: boolean;
  direction: number;
  isFullscreen: boolean;
  onSlideClick?: () => void;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(({
  url,
  alt,
  title,
  index,
  total,
  isActive,
  direction,
  isFullscreen,
  onSlideClick
}, ref) => {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "absolute inset-0",
        "flex items-center justify-center"
      )}
      initial={{ opacity: 0, x: direction > 0 ? 1000 : -1000 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -1000 : 1000 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <img
        src={url}
        className={cn(
          "transition-all duration-300",
          isFullscreen ? 
            "max-h-screen max-w-screen object-contain" : 
            "w-full h-full object-cover"
        )}
        draggable={false}
      />
    </motion.div>
  );
});

Slide.displayName = 'Slide';

export function VillaSlideshow() {
  const { t } = useTranslation();
  const villa = useSelector((state: RootState) => state.villa.villa);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const slideShowRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<number>();
  const dragStartRef = useRef<number>(0);

  // Load slides from villa data
  useEffect(() => {
    if (villa?.slideImages && villa.slideImages.length > 0) {
      setSlides(villa.slideImages.slice(0, MAX_SLIDES));
    }
  }, [villa]);

  // Handle auto-play with cleanup
  useEffect(() => {
    const startAutoPlay = () => {
      if (isPlaying && !isDragging && slides.length > 1) {
        autoPlayTimerRef.current = window.setTimeout(() => {
          setDirection(1);
          setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, AUTOPLAY_INTERVAL);
      }
    };

    const cleanup = () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };

    cleanup();
    startAutoPlay();

    return cleanup;
  }, [isPlaying, isDragging, currentIndex, slides.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious(e);
      } else if (e.key === 'ArrowRight') {
        handleNext(e);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && slides.length > 1) {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  }, [isDragging, slides.length]);

  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && slides.length > 1) {
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [isDragging, slides.length]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setIsPlaying(false);
    dragStartRef.current = e.clientX;
  }, []);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsPlaying(true);
    
    const dragDistance = e.clientX - dragStartRef.current;
    if (Math.abs(dragDistance) > SWIPE_THRESHOLD) {
      if (dragDistance > 0) {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      } else {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }
    }
  }, [isDragging, slides.length]);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(prev => !prev);
  }, []);

  const handleFullscreen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slideShowRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await slideShowRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Don't render if no slides
  if (!slides.length) return null;

  return (
    <div
      ref={slideShowRef}
      className={cn(
        "relative overflow-hidden rounded-lg bg-black/90 transition-all duration-500 ease-in-out",
        "w-full max-w-[100vw] mx-auto",
        isFullscreen ? 
          "fixed inset-0 z-[100] m-0 h-screen w-screen rounded-none" : 
          "aspect-video max-h-[80vh]"
      )}
    >
      <div
        className={cn(
          "relative h-full w-full transition-all duration-300",
          isFullscreen ? "flex items-center justify-center" : "aspect-video"
        )}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onPointerLeave={handleDragEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <Slide
            key={currentIndex}
            url={slides[currentIndex]}
            index={currentIndex}
            total={slides.length}
            isActive={true}
            direction={direction}
            isFullscreen={isFullscreen}
          />
        </AnimatePresence>

        {/* Controls Overlay */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          "opacity-0 hover:opacity-100 touch-none",
          "sm:p-4 md:p-6 lg:p-8",
          isFullscreen && "lg:p-12"
        )}>
          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevious}
              className={cn(
                "pointer-events-auto rounded-full z-10",
                "bg-black/40 hover:bg-black/60 transition-all",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14",
                "flex items-center justify-center",
                "mx-1 sm:mx-3 md:mx-4 lg:mx-6",
                isFullscreen && "lg:w-16 lg:h-16"
              )}
            >
              <ChevronLeft className={cn(
                "transition-transform",
                "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7",
                "text-white/90 hover:text-white"
              )} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className={cn(
                "pointer-events-auto rounded-full z-10",
                "bg-black/40 hover:bg-black/60 transition-all",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14",
                "flex items-center justify-center",
                "mx-1 sm:mx-3 md:mx-4 lg:mx-6",
                isFullscreen && "lg:w-16 lg:h-16"
              )}
            >
              <ChevronRight className={cn(
                "transition-transform",
                "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7",
                "text-white/90 hover:text-white"
              )} />
            </motion.button>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className={cn(
                "rounded-full z-10",
                "bg-black/40 hover:bg-black/60 transition-all",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                "flex items-center justify-center"
              )}
            >
              {isPlaying ? 
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/90 hover:text-white" /> : 
                <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/90 hover:text-white" />
              }
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFullscreen}
              className={cn(
                "rounded-full z-10",
                "bg-black/40 hover:bg-black/60 transition-all",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                "flex items-center justify-center"
              )}
            >
              {isFullscreen ? 
                <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/90 hover:text-white" /> : 
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/90 hover:text-white" />
              }
            </motion.button>
          </div>

          {/* Bottom Controls */}
          <div className={cn(
            "absolute bottom-0 inset-x-0 pointer-events-auto",
            "py-4"
          )}>
            {/* Slide Counter
            <div className="text-center text-white/90 font-medium text-sm sm:text-base">
              <span className="text-white">{currentIndex + 1}</span>
              <span className="mx-1 text-white/60">/</span>
              <span className="text-white/60">{slides.length}</span>
            </div> */}

            {/* Thumbnails */}
            <div className={cn(
              "flex flex-wrap items-center justify-center gap-1 sm:gap-2",
              "sm:grid sm:grid-cols-2 md:flex md:flex-nowrap",
              "mt-2 px-2"
            )}>
              {slides.map((slide, index) => (
                <motion.button
                  key={slide}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "relative flex-none group",
                    "focus:outline-none focus:ring-2 focus:ring-white/50",
                    "transition-transform duration-200"
                  )}
                >
                  <div className={cn(
                    "relative overflow-hidden rounded-md sm:rounded-lg",
                    "transform transition-all duration-300"
                  )}>
                    <img
                      src={slide}
                      alt={`Thumbnail ${index + 1}`}
                      className={cn(
                        "object-cover transition-all duration-300",
                        "w-16 h-12 sm:w-20 sm:h-16 md:w-24 md:h-18 lg:w-28 lg:h-20",
                        isFullscreen && "lg:w-32 lg:h-24",
                        currentIndex === index 
                          ? "opacity-100 scale-105" 
                          : "opacity-50 hover:opacity-75"
                      )}
                      draggable={false}
                    />
                  </div>
                  {currentIndex === index && (
                    <motion.div
                      layoutId="activeThumb"
                      className={cn(
                        "absolute inset-0 rounded-md sm:rounded-lg",
                        "ring-2 ring-white shadow-lg",
                        "transition-all duration-300"
                      )}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}