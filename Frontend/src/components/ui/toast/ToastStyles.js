const style = document.createElement("style");
style.textContent = `
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
`;
document.head.appendChild(style);
