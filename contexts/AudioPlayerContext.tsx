import React, { createContext, useContext, useState, ReactNode } from "react";

interface Track {
  id: string;
  title: string;
  artistName: string;
  artistImage: string;
  duration: string;
  url?: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  play: (track: Track) => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const stop = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    // TODO: Implémenter la logique pour passer à la piste suivante
    console.log("Next track");
  };

  const previousTrack = () => {
    // TODO: Implémenter la logique pour passer à la piste précédente
    console.log("Previous track");
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        play,
        pause,
        stop,
        togglePlayPause,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
