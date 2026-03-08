import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { createAudioPlayer, useAudioPlayerStatus } from "expo-audio";

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
  playlist: Track[];
  setPlaylist: (tracks: Track[]) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [player] = useState(() => createAudioPlayer());
  const wasPlayingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const nextTrackRef = useRef<() => void>(() => {});
  const isManualSwitchRef = useRef(false);

  useEffect(() => {
    return () => { player.remove(); };
  }, []);

  const status = useAudioPlayerStatus(player);

  const play = useCallback(
    (track: Track) => {
      if (!track.url) {
        console.warn("Cannot play track — no URL:", track.title);
        return;
      }

      // Same track: just resume
      if (currentTrack?.id === track.id) {
        player.play();
        setIsPlaying(true);
        return;
      }

      // New track: replace source and play
      isManualSwitchRef.current = true;
      player.replace({ uri: track.url });
      player.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    [currentTrack, player]
  );

  const pause = useCallback(() => {
    player.pause();
    setIsPlaying(false);
  }, [player]);

  const stop = useCallback(() => {
    player.pause();
    setCurrentTrack(null);
    setIsPlaying(false);
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [isPlaying, player]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0 || !currentTrack) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    const next = (idx + 1) % playlist.length;
    play(playlist[next]);
  }, [playlist, currentTrack, play]);

  const previousTrack = useCallback(() => {
    if (playlist.length === 0 || !currentTrack) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    const prev = idx <= 0 ? playlist.length - 1 : idx - 1;
    play(playlist[prev]);
  }, [playlist, currentTrack, play]);

  // Keep refs up to date to avoid stale closures
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Auto-advance when track finishes naturally.
  // Detected by: native player stopped (status.playing = false) while
  // React state still thinks we're playing (isPlayingRef = true).
  // currentTime is NOT used — it can reset to 0 on natural end.
  useEffect(() => {
    if (status.playing) {
      // New track has started — clear the manual switch flag
      isManualSwitchRef.current = false;
    }

    const justStopped = wasPlayingRef.current && !status.playing;

    if (justStopped && isPlayingRef.current && !isManualSwitchRef.current) {
      setIsPlaying(false);
      // Delay gives the native player time to settle before loading next source
      setTimeout(() => nextTrackRef.current(), 200);
    }
    wasPlayingRef.current = status.playing;
  }, [status.playing]);

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
        playlist,
        setPlaylist,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  }
  return context;
}
