import { Badge, BadgeContainer } from '@progress/kendo-react-indicators';

const ingredientCard = ({ item, handleIngredientSelect, selectedIngredient, handleDragStart, validatedIngredients, getFallbackImage, handleDragEnd }) => {
  const isSelected = selectedIngredient && selectedIngredient.id === item.id;

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'info';
      case 'uncommon': return 'success';
      case 'rare': return 'warning';
      case 'legendary': return 'error';
      default: return 'default';
    }
  };

  return (
    <div
      className={`ingredient-card ${isSelected ? 'ingredient-card--selected' : ''}`}
      onClick={() => handleIngredientSelect({ item })}
      draggable={true}
      onDragStart={(e) => handleDragStart(e, item)}
      onDragEnd={handleDragEnd}
      key={item.id}
    >
      <BadgeContainer styles={{ position: 'absolute', top: 0, right: 0 }}>
        <Badge
          themeColor={getRarityColor(item.rarity)}
          position="edge"
          size="small"
        >
          {item.rarity === 'common' && '⭐'}
          {item.rarity === 'uncommon' && '⭐⭐'}
          {item.rarity === 'rare' && '⭐⭐⭐'}
          {item.rarity === 'legendary' && '⭐⭐⭐⭐'}
        </Badge>
      </BadgeContainer>
      <div
        className="ingredient-card__image"
        style={{
          backgroundColor: item.color
        }}
      >
        <img
          src={validatedIngredients[item.id] || item.image}
          alt={item.name}
          className="ingredient-card__img"
          onError={(e) => {
            console.error(`Error loading image for ${item.name}`);
            e.target.src = getFallbackImage(item.color, item.name);
          }}
        />
        <div className="ingredient-card__icon">
          {item.rarity === 'legendary' && '✨'}
          {item.rarity === 'rare' && '⭐'}
          {item.rarity === 'uncommon' && '✦'}
          {item.rarity === 'common' && '•'}
        </div>
        <div className="ingredient-card__drag-hint">
          <span className="drag-icon">↓</span>
        </div>
      </div>
      <div className="ingredient-card__content">
        <h3 className="ingredient-card__name">{item.name}</h3>
        <span className={`ingredient-card__rarity ingredient-card__rarity--${item.rarity}`}>
          {item.rarity === 'common' && 'Common'}
          {item.rarity === 'uncommon' && 'Uncommon'}
          {item.rarity === 'rare' && 'Rare'}
          {item.rarity === 'legendary' && 'Legendary'}
        </span>
      </div>
    </div>
  );
};

export default ingredientCard;
