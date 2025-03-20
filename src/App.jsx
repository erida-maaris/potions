import { useState, useEffect } from 'react';

import PotionMixer from './components/PotionMixer';
import OrdersPanel from './components/OrdersPanel/OrdersPanel';
import Header from './components/Header/Header';
import potions from './data/potions.json';
import ingredients from './data/ingredients.json';

import './styles/globals.scss';

const App = () => {
  const [stars, setStars] = useState([]);
  const [gold, setGold] = useState(0);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  const generateRandomOrder = () => {
    const randomPotion = potions.potions[Math.floor(Math.random() * potions.potions.length)];

    const shuffledIngredients = [...ingredients].sort(() => Math.random() - 0.5);
    const selectedIngredients = shuffledIngredients.slice(0, 3);

    const rewardVariation = randomPotion.baseReward * 0.2;
    const finalReward = Math.floor(
      randomPotion.baseReward + (Math.random() * 2 - 1) * rewardVariation
    );

    const requiredIngredients = selectedIngredients.map(ing => ({
      name: ing.name,
      amount: Math.floor(Math.random() * 40) + 30
    }));

    return {
      potionName: randomPotion.name,
      reward: finalReward,
      requiredIngredients: requiredIngredients,
      color: randomPotion.color
    };
  };

  const updateOrders = () => {
    const newOrders = Array(3).fill(null).map(() => generateRandomOrder());
    setAvailableOrders(newOrders);
  };

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          top: `${Math.random() * window.innerHeight}px`,
          left: `${Math.random() * window.innerWidth}px`,
          size: `${Math.random() * 3 + 1}px`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * 2}s`
        });
      }
      setStars(newStars);
    };

    generateStars();
    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);
  }, []);

  useEffect(() => {
    updateOrders();
  }, []);

  const handleAcceptOrder = (orderIndex) => {
    if (currentOrder) return;

    const order = availableOrders[orderIndex];
    setCurrentOrder(order);

    const newOrders = [...availableOrders];
    newOrders[orderIndex] = generateRandomOrder();
    setAvailableOrders(newOrders);
  };

  const handlePotionComplete = () => {
    if (currentOrder) {
      setGold(prevGold => prevGold + currentOrder.reward);
      setCurrentOrder(null);
    }
  };

  return (
    <div className="app">
      <div className="stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDuration: star.animationDuration,
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </div>
      <Header gold={gold} />
      <div className="app-content">
        <OrdersPanel
          orders={availableOrders}
          onAcceptOrder={handleAcceptOrder}
          currentOrder={currentOrder}
        />
        <PotionMixer
          currentOrder={currentOrder}
          onPotionComplete={handlePotionComplete}
        />
      </div>
    </div>
  );
};

export default App;
