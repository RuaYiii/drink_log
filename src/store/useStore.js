import { create } from 'zustand';

const useStore = create((set, get) => ({
  isReady: false,
  ingredients: { bases: [], modifiers: [] },
  cocktails: [],
  shaker: [],
  
  initializeConfig: async () => {
    try {
      // First fetch the global paths config
      //const configRes = await fetch('/config.json');
      const configRes = await fetch(`${import.meta.env.BASE_URL}config.json`);//为了在github pages上部署时，使用import.meta.env.BASE_URL来获取正确的路径
      const config = await configRes.json();
      
      // Then fetch the actual data
      const [ingredientsRes, cocktailsRes] = await Promise.all([
        fetch(config.ingredientsUrl),
        fetch(config.cocktailsUrl)
      ]);
      
      const ingredients = await ingredientsRes.json();
      const cocktails = await cocktailsRes.json();
      
      set({ ingredients, cocktails, isReady: true });
    } catch (err) {
      console.error("Failed to fetch initial configuration:", err);
      alert("核心配置文件加载失败，请检查网络或部署路径。");
    }
  },
  
  addToShaker: (item) => set((state) => {
    // Avoid duplicates
    if (state.shaker.find(i => i.id === item.id)) return state;
    return { shaker: [...state.shaker, item] };
  }),
  
  removeFromShaker: (id) => set((state) => ({
    shaker: state.shaker.filter(item => item.id !== id)
  })),
  
  clearShaker: () => set({ shaker: [] }),

  loadCustomData: (customIngredients, customCocktails) => set({
    ingredients: customIngredients || get().ingredients,
    cocktails: customCocktails || get().cocktails,
    shaker: []
  }),
}));

export default useStore;
