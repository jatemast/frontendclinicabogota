import { onUnmounted } from 'vue';
import Pusher from 'pusher-js';

export function useRealtime(channelName: string, eventName: string, callback: (data: any) => void) {

    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;

    if (!pusherKey) {
        console.error('Pusher Key no configurada en .env');
        return;
    }

    // 2. Inicializar Pusher
    const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true
    });

    // 3. Suscribirse al canal y vincular el evento
    const channel = pusher.subscribe(channelName);
    
    channel.bind(eventName, (data: any) => {
        callback(data);
    });

    // 4. Limpieza automática al destruir el componente que usa este composable
    onUnmounted(() => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
        // console.log(`Desconectado de Pusher: ${channelName}`);
    });

    return {
        pusher,
        channel
    };
}