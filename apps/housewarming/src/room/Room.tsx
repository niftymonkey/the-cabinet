import { useEffect, useRef } from 'react';
import { createRoom, type RoomHandle } from './room.ts';

export function Room() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    let handle: RoomHandle | null = null;
    let cancelled = false;
    void createRoom(host).then((room) => {
      if (cancelled) {
        room.destroy();
      } else {
        handle = room;
      }
    });
    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, []);

  return <div ref={hostRef} className="room" />;
}
