import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("https://picsum.photos/id/180/1920/1080?blur=2")',
          referrerPolicy: 'no-referrer' as any
        }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {title && (
            <div className="px-8 pt-8 pb-4 text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
              <p className="text-white/60 mt-2">CollabSpace Team System</p>
            </div>
          )}
          <div className="p-8">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
