export interface FoodItem {
  id: string;
  name: string;
  calories: number; // per 100g
  protein: number;  // grams per 100g
  carbs: number;    // grams per 100g
  fat: number;      // grams per 100g
  defaultPortion?: number; // default serving size in grams
  portionLabel?: string;   // e.g., "1 fatia", "1 xícara"
}

export const FOOD_DATABASE: FoodItem[] = [
  // === CARNES E PROTEÍNAS ===
  { id: 'frango-peito', name: 'Peito de Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, defaultPortion: 120, portionLabel: '1 filé' },
  { id: 'frango-coxa', name: 'Coxa de Frango Assada', calories: 215, protein: 26, carbs: 0, fat: 12, defaultPortion: 100, portionLabel: '1 coxa' },
  { id: 'carne-boi-patinho', name: 'Patinho Bovino Grelhado', calories: 186, protein: 28, carbs: 0, fat: 8, defaultPortion: 120, portionLabel: '1 bife' },
  { id: 'carne-boi-alcatra', name: 'Alcatra Bovina', calories: 198, protein: 26, carbs: 0, fat: 10, defaultPortion: 120, portionLabel: '1 bife' },
  { id: 'carne-picanha', name: 'Picanha Bovina', calories: 278, protein: 25, carbs: 0, fat: 19, defaultPortion: 120, portionLabel: '1 porção' },
  { id: 'peixe-tilapia', name: 'Tilápia Grelhada', calories: 128, protein: 26, carbs: 0, fat: 2.7, defaultPortion: 120, portionLabel: '1 filé' },
  { id: 'peixe-salmao', name: 'Salmão Grelhado', calories: 206, protein: 29, carbs: 0, fat: 10, defaultPortion: 120, portionLabel: '1 filé' },
  { id: 'peixe-bacalhau', name: 'Bacalhau Cozido', calories: 105, protein: 24, carbs: 0, fat: 0.9, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'ovo-cozido', name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, defaultPortion: 50, portionLabel: '1 unidade' },
  { id: 'ovo-mexido', name: 'Ovo Mexido', calories: 148, protein: 10, carbs: 1.4, fat: 11, defaultPortion: 50, portionLabel: '1 unidade' },
  { id: 'atum-lata', name: 'Atum em Água (Lata)', calories: 108, protein: 25, carbs: 0, fat: 0.5, defaultPortion: 85, portionLabel: '1 lata' },
  { id: 'sardinha', name: 'Sardinha em Conserva', calories: 208, protein: 25, carbs: 0, fat: 11, defaultPortion: 85, portionLabel: '1 lata' },
  { id: 'linguica-frango', name: 'Linguiça de Frango', calories: 175, protein: 17, carbs: 2, fat: 11, defaultPortion: 80, portionLabel: '1 gomo' },
  { id: 'presunto', name: 'Presunto Fatiado', calories: 145, protein: 18, carbs: 2.5, fat: 7, defaultPortion: 30, portionLabel: '2 fatias' },
  { id: 'peito-peru', name: 'Peito de Peru Fatiado', calories: 107, protein: 19, carbs: 2, fat: 2.3, defaultPortion: 30, portionLabel: '2 fatias' },

  // === GRÃOS E CEREAIS ===
  { id: 'arroz-branco', name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultPortion: 100, portionLabel: '1 escumadeira' },
  { id: 'arroz-integral', name: 'Arroz Integral Cozido', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, defaultPortion: 100, portionLabel: '1 escumadeira' },
  { id: 'feijao-carioca', name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 14, fat: 0.5, defaultPortion: 86, portionLabel: '1 concha' },
  { id: 'feijao-preto', name: 'Feijão Preto Cozido', calories: 77, protein: 4.5, carbs: 14, fat: 0.5, defaultPortion: 86, portionLabel: '1 concha' },
  { id: 'lentilha', name: 'Lentilha Cozida', calories: 116, protein: 9, carbs: 20, fat: 0.4, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'grao-bico', name: 'Grão-de-Bico Cozido', calories: 164, protein: 9, carbs: 27, fat: 2.6, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'aveia', name: 'Aveia em Flocos', calories: 389, protein: 17, carbs: 66, fat: 7, defaultPortion: 40, portionLabel: '4 colheres' },
  { id: 'macarrao', name: 'Macarrão Cozido', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, defaultPortion: 150, portionLabel: '1 prato' },
  { id: 'macarrao-integral', name: 'Macarrão Integral Cozido', calories: 124, protein: 5.3, carbs: 26, fat: 1.1, defaultPortion: 150, portionLabel: '1 prato' },
  { id: 'quinoa', name: 'Quinoa Cozida', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, defaultPortion: 100, portionLabel: '1 porção' },

  // === PÃES E DERIVADOS ===
  { id: 'pao-frances', name: 'Pão Francês', calories: 300, protein: 9.4, carbs: 58, fat: 3.1, defaultPortion: 50, portionLabel: '1 unidade' },
  { id: 'pao-integral', name: 'Pão Integral', calories: 247, protein: 9.4, carbs: 47, fat: 3.3, defaultPortion: 30, portionLabel: '1 fatia' },
  { id: 'pao-de-queijo', name: 'Pão de Queijo', calories: 290, protein: 7.5, carbs: 42, fat: 10, defaultPortion: 40, portionLabel: '1 unidade' },
  { id: 'torrada', name: 'Torrada Simples', calories: 392, protein: 11, carbs: 75, fat: 5.5, defaultPortion: 15, portionLabel: '1 unidade' },
  { id: 'biscoito-agua-sal', name: 'Biscoito de Água e Sal', calories: 388, protein: 9, carbs: 72, fat: 7, defaultPortion: 30, portionLabel: '6 unidades' },
  { id: 'tapioca', name: 'Tapioca', calories: 340, protein: 0.2, carbs: 85, fat: 0.1, defaultPortion: 70, portionLabel: '1 unidade' },

  // === LATICÍNIOS ===
  { id: 'leite-integral', name: 'Leite Integral', calories: 61, protein: 3.2, carbs: 4.7, fat: 3.2, defaultPortion: 200, portionLabel: '1 copo' },
  { id: 'leite-desnatado', name: 'Leite Desnatado', calories: 35, protein: 3.4, carbs: 5, fat: 0.2, defaultPortion: 200, portionLabel: '1 copo' },
  { id: 'iogurte-natural', name: 'Iogurte Natural Integral', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, defaultPortion: 170, portionLabel: '1 pote' },
  { id: 'iogurte-grego', name: 'Iogurte Grego Natural', calories: 133, protein: 9, carbs: 5, fat: 9, defaultPortion: 170, portionLabel: '1 pote' },
  { id: 'queijo-minas', name: 'Queijo Minas Frescal', calories: 264, protein: 17, carbs: 3, fat: 20, defaultPortion: 30, portionLabel: '1 fatia' },
  { id: 'queijo-cottage', name: 'Queijo Cottage', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, defaultPortion: 100, portionLabel: '2 colheres' },
  { id: 'requeijao', name: 'Requeijão Cremoso', calories: 254, protein: 8, carbs: 4.1, fat: 23, defaultPortion: 30, portionLabel: '1 colher sopa' },
  { id: 'cream-cheese', name: 'Cream Cheese', calories: 342, protein: 6, carbs: 4.1, fat: 34, defaultPortion: 30, portionLabel: '1 colher sopa' },
  { id: 'manteiga', name: 'Manteiga', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, defaultPortion: 10, portionLabel: '1 colher chá' },

  // === FRUTAS ===
  { id: 'banana', name: 'Banana Prata', calories: 98, protein: 1.3, carbs: 26, fat: 0.1, defaultPortion: 90, portionLabel: '1 unidade' },
  { id: 'banana-nanica', name: 'Banana Nanica', calories: 92, protein: 1.3, carbs: 24, fat: 0.1, defaultPortion: 100, portionLabel: '1 unidade' },
  { id: 'maca', name: 'Maçã', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultPortion: 130, portionLabel: '1 unidade' },
  { id: 'laranja', name: 'Laranja', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, defaultPortion: 150, portionLabel: '1 unidade' },
  { id: 'mamao', name: 'Mamão Papaia', calories: 43, protein: 0.5, carbs: 11, fat: 0.1, defaultPortion: 200, portionLabel: '1 fatia' },
  { id: 'melancia', name: 'Melancia', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, defaultPortion: 200, portionLabel: '1 fatia' },
  { id: 'uva', name: 'Uva', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, defaultPortion: 80, portionLabel: '1 cacho pequeno' },
  { id: 'morango', name: 'Morango', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, defaultPortion: 100, portionLabel: '10 unidades' },
  { id: 'manga', name: 'Manga', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, defaultPortion: 150, portionLabel: '1/2 unidade' },
  { id: 'abacate', name: 'Abacate', calories: 160, protein: 2, carbs: 9, fat: 15, defaultPortion: 100, portionLabel: '1/4 unidade' },
  { id: 'goiaba', name: 'Goiaba', calories: 68, protein: 2.6, carbs: 14, fat: 1, defaultPortion: 100, portionLabel: '1 unidade' },
  { id: 'abacaxi', name: 'Abacaxi', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, defaultPortion: 100, portionLabel: '1 fatia' },
  { id: 'kiwi', name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, defaultPortion: 70, portionLabel: '1 unidade' },
  { id: 'melao', name: 'Melão', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, defaultPortion: 200, portionLabel: '1 fatia' },

  // === VEGETAIS E VERDURAS ===
  { id: 'batata-doce', name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'batata-ingles', name: 'Batata Inglesa Cozida', calories: 82, protein: 2.5, carbs: 19, fat: 0.1, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'mandioca', name: 'Mandioca Cozida', calories: 125, protein: 1.1, carbs: 30, fat: 0.3, defaultPortion: 100, portionLabel: '1 pedaço' },
  { id: 'inhame', name: 'Inhame Cozido', calories: 118, protein: 1.5, carbs: 28, fat: 0.1, defaultPortion: 100, portionLabel: '1 pedaço' },
  { id: 'brocolis', name: 'Brócolis Cozido', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'cenoura', name: 'Cenoura Crua', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, defaultPortion: 80, portionLabel: '1 unidade' },
  { id: 'alface', name: 'Alface', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, defaultPortion: 50, portionLabel: 'Porção média' },
  { id: 'tomate', name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, defaultPortion: 100, portionLabel: '1 unidade' },
  { id: 'cebola', name: 'Cebola Crua', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, defaultPortion: 70, portionLabel: '1/2 unidade' },
  { id: 'abobrinha', name: 'Abobrinha Cozida', calories: 17, protein: 1.2, carbs: 3.6, fat: 0.3, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'berinjela', name: 'Berinjela Assada', calories: 25, protein: 1, carbs: 6, fat: 0.2, defaultPortion: 100, portionLabel: '1 porção' },
  { id: 'couve', name: 'Couve Refogada', calories: 50, protein: 3, carbs: 9, fat: 1, defaultPortion: 50, portionLabel: 'Porção média' },
  { id: 'espinafre', name: 'Espinafre', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, defaultPortion: 50, portionLabel: 'Porção média' },
  { id: 'pepino', name: 'Pepino', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, defaultPortion: 100, portionLabel: '1/2 unidade' },
  { id: 'milho-verde', name: 'Milho Verde Cozido', calories: 86, protein: 3.3, carbs: 19, fat: 1.4, defaultPortion: 130, portionLabel: '1 espiga pequena' },

  // === PREPARAÇÕES BRASILEIRAS ===
  { id: 'feijoada', name: 'Feijoada Completa', calories: 150, protein: 8, carbs: 12, fat: 7, defaultPortion: 300, portionLabel: '1 prato' },
  { id: 'coxinha', name: 'Coxinha de Frango', calories: 250, protein: 10, carbs: 22, fat: 14, defaultPortion: 80, portionLabel: '1 unidade' },
  { id: 'esfiha', name: 'Esfiha de Carne', calories: 260, protein: 11, carbs: 30, fat: 11, defaultPortion: 70, portionLabel: '1 unidade' },
  { id: 'bolo-milho', name: 'Bolo de Milho', calories: 310, protein: 5, carbs: 52, fat: 9, defaultPortion: 80, portionLabel: '1 fatia' },
  { id: 'pudim', name: 'Pudim de Leite', calories: 210, protein: 6, carbs: 32, fat: 7, defaultPortion: 100, portionLabel: '1 fatia' },
  { id: 'brigadeiro', name: 'Brigadeiro', calories: 390, protein: 3, carbs: 56, fat: 16, defaultPortion: 30, portionLabel: '1 unidade' },
  { id: 'moqueca', name: 'Moqueca de Peixe', calories: 140, protein: 14, carbs: 4, fat: 8, defaultPortion: 200, portionLabel: '1 porção' },
  { id: 'frango-grelhado-limao', name: 'Frango Grelhado ao Limão', calories: 160, protein: 30, carbs: 1, fat: 4, defaultPortion: 120, portionLabel: '1 filé' },
  { id: 'sopa-legumes', name: 'Sopa de Legumes', calories: 45, protein: 2, carbs: 9, fat: 0.5, defaultPortion: 300, portionLabel: '1 prato' },
  { id: 'salada-tropical', name: 'Salada Mista com Legumes', calories: 25, protein: 1.5, carbs: 5, fat: 0.3, defaultPortion: 150, portionLabel: '1 prato' },

  // === BEBIDAS ===
  { id: 'cafe-preto', name: 'Café Preto (sem açúcar)', calories: 2, protein: 0.3, carbs: 0, fat: 0, defaultPortion: 50, portionLabel: '1 xícara' },
  { id: 'cafe-leite', name: 'Café com Leite', calories: 37, protein: 1.9, carbs: 2.8, fat: 1.9, defaultPortion: 200, portionLabel: '1 copo' },
  { id: 'suco-laranja', name: 'Suco de Laranja Natural', calories: 44, protein: 0.7, carbs: 10, fat: 0.2, defaultPortion: 200, portionLabel: '1 copo' },
  { id: 'suco-acerola', name: 'Suco de Acerola', calories: 39, protein: 0.8, carbs: 9.5, fat: 0.3, defaultPortion: 200, portionLabel: '1 copo' },
  { id: 'vitamina-banana', name: 'Vitamina de Banana com Leite', calories: 120, protein: 3.5, carbs: 22, fat: 2.5, defaultPortion: 250, portionLabel: '1 copo' },
  { id: 'cha-verde', name: 'Chá Verde (sem açúcar)', calories: 1, protein: 0, carbs: 0.2, fat: 0, defaultPortion: 240, portionLabel: '1 xícara' },
  { id: 'agua-de-coco', name: 'Água de Coco', calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, defaultPortion: 280, portionLabel: '1 vidro' },
  { id: 'whey-protein', name: 'Whey Protein (em pó)', calories: 378, protein: 73, carbs: 9, fat: 4, defaultPortion: 30, portionLabel: '1 scoop' },

  // === OLEAGINOSAS E GORDURAS ===
  { id: 'amendoim', name: 'Amendoim', calories: 567, protein: 26, carbs: 16, fat: 49, defaultPortion: 30, portionLabel: '1 punhado' },
  { id: 'castanha-caju', name: 'Castanha de Caju', calories: 553, protein: 18, carbs: 30, fat: 44, defaultPortion: 30, portionLabel: '1 punhado' },
  { id: 'castanha-para', name: 'Castanha-do-Pará', calories: 656, protein: 14, carbs: 12, fat: 66, defaultPortion: 15, portionLabel: '2 unidades' },
  { id: 'amendocrem', name: 'Pasta de Amendoim', calories: 588, protein: 25, carbs: 20, fat: 50, defaultPortion: 30, portionLabel: '2 colheres sopa' },
  { id: 'azeite', name: 'Azeite de Oliva', calories: 884, protein: 0, carbs: 0, fat: 100, defaultPortion: 10, portionLabel: '1 colher sopa' },
  { id: 'oleo-coco', name: 'Óleo de Coco', calories: 892, protein: 0, carbs: 0, fat: 100, defaultPortion: 10, portionLabel: '1 colher sopa' },

  // === DOCES E SOBREMESAS ===
  { id: 'chocolate-amargo', name: 'Chocolate Amargo 70%', calories: 598, protein: 8, carbs: 31, fat: 43, defaultPortion: 30, portionLabel: '3 quadradinhos' },
  { id: 'sorvete', name: 'Sorvete de Creme', calories: 207, protein: 3.5, carbs: 24, fat: 11, defaultPortion: 100, portionLabel: '2 bolas' },
  { id: 'geleia', name: 'Geléia de Frutas', calories: 278, protein: 0.4, carbs: 69, fat: 0.1, defaultPortion: 20, portionLabel: '1 colher sopa' },
  { id: 'mel', name: 'Mel', calories: 304, protein: 0.3, carbs: 82, fat: 0, defaultPortion: 20, portionLabel: '1 colher sopa' },

  // === SUPLEMENTOS E FUNCIONAIS ===
  { id: 'chia', name: 'Semente de Chia', calories: 486, protein: 17, carbs: 42, fat: 31, defaultPortion: 15, portionLabel: '1 colher sopa' },
  { id: 'linhaça', name: 'Semente de Linhaça', calories: 534, protein: 18, carbs: 29, fat: 42, defaultPortion: 15, portionLabel: '1 colher sopa' },
  { id: 'proteina-amendoim', name: 'Proteína de Amendoim', calories: 371, protein: 45, carbs: 20, fat: 12, defaultPortion: 30, portionLabel: '1 scoop' },
];

export function searchFoods(query: string): FoodItem[] {
  if (!query.trim()) return FOOD_DATABASE.slice(0, 20);
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return FOOD_DATABASE.filter(f => {
    const name = f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes(q);
  }).slice(0, 30);
}

export function calculateNutrition(food: FoodItem, grams: number) {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
  };
}
