import React, { useState, useEffect, useRef } from 'react';
import { ListView } from '@progress/kendo-react-listview';
import { Button } from '@progress/kendo-react-buttons';
import { Tooltip } from '@progress/kendo-react-tooltip';
import { Dialog } from '@progress/kendo-react-dialogs';
import { TileLayout } from '@progress/kendo-react-layout';
import ingredients from '../data/ingredients.json';
import settings from '../data/settings.json';
import '../styles/PotionMixer.scss';
import ingredientCard from './IngredientCard';
import IngredientCard from './IngredientCard';

const PotionMixer = ({ currentOrder, onPotionComplete }) => {
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [result, setResult] = useState(null);
  const [isMixing, setIsMixing] = useState(false);
  const [potionColor, setPotionColor] = useState('');
  const [draggedIngredient, setDraggedIngredient] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverCauldron, setIsOverCauldron] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [brewingErrors, setBrewingErrors] = useState(0);
  const [validatedIngredients, setValidatedIngredients] = useState({});
  const [showResultDialog, setShowResultDialog] = useState(false);
  const cauldronRef = useRef(null);

  const validateImageUrl = (url, id) => {
    if (validatedIngredients[id]) {
      return validatedIngredients[id];
    }

    const img = new Image();
    img.onload = () => {
      setValidatedIngredients(prev => ({
        ...prev,
        [id]: url
      }));
    };
    img.onerror = () => {
      setValidatedIngredients(prev => ({
        ...prev,
        [id]: null
      }));
    };
    img.src = url;
    return url;
  };

  const getFallbackImage = (color, name) => {
    const colorCode = color.replace('#', '%23');
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${colorCode}" /><text x="50" y="50" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">${name.charAt(0)}</text></svg>`;
  };

  useEffect(() => {
    ingredients.forEach(ing => {
      validateImageUrl(ing.image, ing.id);
    });
  }, []);

  const handleIngredientSelect = (event) => {
    const selectedItem = event.item;
    setSelectedIngredient(selectedItem === selectedIngredient ? null : selectedItem);
  };

  const handleDragStart = (e, ingredient) => {
    setDraggedIngredient(ingredient);
    setIsDragging(true);

    e.currentTarget.classList.add('dragging');

    const dragImage = new Image();
    const validatedImage = validatedIngredients[ingredient.id];

    if (validatedImage) {
      dragImage.src = validatedImage;
    } else if (ingredient.image) {
      dragImage.src = ingredient.image;
    } else {
      dragImage.src = getFallbackImage(ingredient.color, ingredient.name);
    }

    dragImage.width = 50;
    dragImage.height = 50;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 25, 25);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);

    e.dataTransfer.setData('text/plain', ingredient.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setIsOverCauldron(false);

    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (cauldronRef.current && cauldronRef.current.contains(e.target)) {
      setIsOverCauldron(true);
    } else {
      setIsOverCauldron(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isOverCauldron && draggedIngredient) {
      const newIngredient = {
        ...draggedIngredient,
        amount: currentOrder.requiredIngredients.find(ing => ing.name.toLowerCase() === draggedIngredient.name.toLowerCase())?.amount || 50,
        addedAt: Date.now()
      };

      setAddedIngredients(prev => [...prev, newIngredient]);
      setDraggedIngredient(null);
    }
  };

  const handleMixPotion = () => {
    if (addedIngredients.length === 0) {
      setResult('Please add at least one ingredient before mixing the potion.');
      return;
    }

    if (!currentOrder) {
      setResult('Accept an order first!');
      return;
    }

    setIsMixing(true);

    if (addedIngredients.length > 0) {
      const colors = addedIngredients.map(ing => ing.color.replace('#', ''));
      const mixedColor = mixColors(colors);
      setPotionColor(`#${mixedColor}`);
    }

    setTimeout(() => {
      const missingIngredients = currentOrder.requiredIngredients.filter(
        required => !addedIngredients.some(ing => ing.name.toLowerCase() === required.name.toLowerCase())
      );

      const extraIngredients = addedIngredients.filter(
        ing => !currentOrder.requiredIngredients.some(required => required.name.toLowerCase() === ing.name.toLowerCase())
      );

      let potionQuality;
      if (missingIngredients.length > 0) {
        potionQuality = 'incomplete';
      } else if (extraIngredients.length > 0) {
        potionQuality = 'spoiled';
      } else {
        potionQuality = 'excellent';
      }

      let resultText = `You have created an ${potionQuality} potion.\n`;

      if (missingIngredients.length > 0) {
        resultText += `\nMissing ingredients: ${missingIngredients.map(ing => ing.name).join(', ')}`;
      }

      if (extraIngredients.length > 0) {
        resultText += `\nExtra ingredients: ${extraIngredients.map(ing => ing.name).join(', ')}`;
      }

      const isCorrectPotion = potionQuality === 'excellent';
      const hasAllIngredients = missingIngredients.length === 0 && extraIngredients.length === 0;

      if (isCorrectPotion && hasAllIngredients) {
        resultText += '\n\n🎉 Excellent! Order completed successfully!';
        onPotionComplete();
      } else {
        resultText += '\n\n❌ This potion does not match the order. Try again!';
        if (!hasAllIngredients) {
          resultText += '\nCheck the ingredients!';
        }
      }

      setResult(resultText);
      setShowResultDialog(true);
      setIsMixing(false);

      setAddedIngredients([]);
      setBrewingErrors(0);
    }, settings.brewing.mixingTime);
  };

  const mixColors = (colors) => {
    let r = 0, g = 0, b = 0;

    colors.forEach(color => {
      r += parseInt(color.substring(0, 2), 16);
      g += parseInt(color.substring(2, 4), 16);
      b += parseInt(color.substring(4, 6), 16);
    });

    r = Math.floor(r / colors.length);
    g = Math.floor(g / colors.length);
    b = Math.floor(b / colors.length);

    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const sortIngredients = (ingredients) => {
    const rarityOrder = {
      'common': 1,
      'uncommon': 2,
      'rare': 3,
      'legendary': 4
    };

    return [...ingredients].sort((a, b) => {
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  };

  const sortedIngredients = sortIngredients(ingredients);

  return (
    <div className="potion-mixer" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="potion-mixer__main-content">
        <h2 className="potion-mixer__title">Mix The Potion</h2>
        <p className="potion-mixer__description">
          Choose ingredients and drop them in the cauldron to create a potion
        </p>

        <div className="potion-mixer__form-group">
          <label className="potion-mixer__label">Ingredients:</label>
          <div className="potion-mixer__ingredients-gallery">
            <div className="ingredients-grid">
              {sortedIngredients.map((item) => (
                <Tooltip styles={{ position: 'relative' }} key={item.id} position="top">
                  <IngredientCard
                    item={item}
                    handleIngredientSelect={handleIngredientSelect}
                    selectedIngredient={selectedIngredient}
                    getFallbackImage={getFallbackImage}
                    validatedIngredients={validatedIngredients}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                  />
                </Tooltip>
              ))}
            </div>
          </div>

          {selectedIngredient && (
            <div className="potion-mixer__ingredient-info">
              <div className="potion-mixer__ingredient-image">
                <img
                  src={validatedIngredients[selectedIngredient.id] || selectedIngredient.image}
                  alt={selectedIngredient.name}
                  className="potion-mixer__ingredient-img"
                  onError={(e) => {
                    console.error(`Помилка завантаження зображення для ${selectedIngredient.name}`);
                    e.target.src = getFallbackImage(selectedIngredient.color, selectedIngredient.name);
                  }}
                />
              </div>
              <div className="potion-mixer__ingredient-details">
                <h3 className="potion-mixer__ingredient-name">{selectedIngredient.name}</h3>
                <span className={`potion-mixer__rarity potion-mixer__rarity--${selectedIngredient.rarity}`}>
                  {selectedIngredient.rarity === 'common' && 'Common'}
                  {selectedIngredient.rarity === 'uncommon' && 'Uncommon'}
                  {selectedIngredient.rarity === 'rare' && 'Rare'}
                  {selectedIngredient.rarity === 'legendary' && 'Legendary'}
                </span>
                <p className="potion-mixer__ingredient-description">{selectedIngredient.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="potion-mixer__cauldron-container">
          <div className={`potion-mixer__added-ingredients ${addedIngredients.length > 0 ? 'has-ingredients' : ''}`}>
            {addedIngredients.length > 0 && (
              <div className="added-ingredients-list">
                <h3>Added Ingredients:</h3>
                <ul>
                  {addedIngredients.map((ing, index) => (
                    <li key={`${ing.id}-${ing.addedAt}`} className="added-ingredient">
                      <div className="added-ingredient__image">
                        <img
                          src={validatedIngredients[ing.id] || ing.image}
                          alt={ing.name}
                          className="added-ingredient__img"
                          onError={(e) => {
                            console.error(`Помилка завантаження зображення для ${ing.name}`);
                            e.target.src = getFallbackImage(ing.color, ing.name);
                          }}
                        />
                      </div>
                      <div className="added-ingredient__info">
                        <span className="added-ingredient__name">{ing.name}</span>
                        <span className={`added-ingredient__rarity added-ingredient__rarity--${ing.rarity}`}>
                          {ing.rarity === 'common' && 'Common'}
                          {ing.rarity === 'uncommon' && 'Uncommon'}
                          {ing.rarity === 'rare' && 'Rare'}
                          {ing.rarity === 'legendary' && 'Legendary'}
                        </span>
                      </div>
                      <span className="added-ingredient__amount">{ing.amount.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isMixing ? (
            <div className="potion-mixer__brewing-animation">
              <div className="cauldron" ref={cauldronRef}>
                <div className="potion-liquid" style={{ backgroundColor: potionColor }}>
                  {addedIngredients.length > 0 && (
                    <div className="potion-ingredients">
                      {addedIngredients.map((ing, index) => (
                        <div
                          key={`particle-${ing.id}-${ing.addedAt}-${index}`}
                          className="potion-ingredient-particle"
                          style={{
                            backgroundColor: ing.color,
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 80}%`,
                            width: `${Math.random() * 6 + 6}px`,
                            height: `${Math.random() * 6 + 6}px`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bubbles">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`bubble bubble-${i + 1}`}></div>
                  ))}
                </div>
              </div>
              <p className="brewing-text">Mixing potion...</p>
            </div>
          ) : (
            <div className={`potion-mixer__cauldron ${isOverCauldron ? 'cauldron-highlight' : ''}`} ref={cauldronRef}>
              <div className="cauldron">
                <div
                  className="potion-liquid"
                  style={{
                    backgroundColor: addedIngredients.length > 0
                      ? `#${mixColors(addedIngredients.map(ing => ing.color.replace('#', '')))}`
                      : '#333'
                  }}
                >
                  {addedIngredients.length > 0 && (
                    <div className="potion-ingredients">
                      {addedIngredients.map((ing, index) => (
                        <div
                          key={`particle-${ing.id}-${ing.addedAt}-${index}`}
                          className="potion-ingredient-particle"
                          style={{
                            backgroundColor: ing.color,
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 80}%`,
                            width: `${Math.random() * 6 + 6}px`,
                            height: `${Math.random() * 6 + 6}px`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="cauldron-hint">
                  {isDragging ? 'Drop here' : 'Drag ingredient here'}
                </div>
              </div>
              <Button
                primary={true}
                onClick={handleMixPotion}
                className="potion-mixer__button"
                disabled={addedIngredients.length === 0}
              >
                Mix Potion
              </Button>
            </div>
          )}
        </div>

        {showResultDialog && (
          <Dialog
            title="Mixing Result"
            closeIcon={true}
            onClose={() => setShowResultDialog(false)}
            width={400}
          >
            <div className="result-dialog-content">
              {result && result.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </Dialog>
        )}
      </div>

      {currentOrder && (
        <div className="potion-mixer__current-order">
          <div className="order-card active-order"
            style={{
              '--potion-color': currentOrder.color,
              borderColor: `${currentOrder.color}66`,
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1), 
                ${currentOrder.color}22
              )`
            }}
          >
            <div className="active-order-badge">Current Order</div>
            <div
              className="card-glow"
              style={{
                background: `radial-gradient(circle at 50% 0%, 
                  ${currentOrder.color}33, 
                  transparent 70%)`
              }}
            ></div>
            <div className="order-content">
              <h3>
                <span className="order-icon">⚗</span>
                {currentOrder.potionName}
              </h3>
              <div className="ingredients-section">
                <p>
                  <span className="ingredients-icon">📜</span>
                  Required ingredients:
                </p>
                <ul className="ingredients-list">
                  {currentOrder.requiredIngredients.map((ingredient, i) => (
                    <li key={i}>
                      <span className="ingredient-name">{ingredient.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="reward">
                <span className="gold-icon">💰</span>
                Reward: {currentOrder.reward} gold
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotionMixer;
