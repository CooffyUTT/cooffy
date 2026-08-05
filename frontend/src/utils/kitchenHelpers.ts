export const getTimeBadgeColor = (mins: number): string => {
  if (mins <= 5) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (mins <= 10) return 'bg-amber-100 text-amber-900 border-amber-300';
  if (mins <= 15) return 'bg-orange-100 text-orange-900 border-orange-300';
  return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
};

export const getServiceTypeBadge = (type: string) => {
  switch (type) {
    case 'takeaway':
      return { label: 'Para llevar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'dine_in':
      return { label: 'Consumir aqui', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'preorder':
    default:
      return { label: 'Pedido anticipado', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
};
