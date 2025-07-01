const socket = io();

socket.on("connect", () => {
  console.log("✅ Conectado ao Socket.IO");
});

socket.on("atualizarPedidos", () => {
  console.log("🔄 Pedido novo ou editado! Recarregando página...");
  location.reload();
});