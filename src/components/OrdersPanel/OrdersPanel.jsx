import React from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, CardActions } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import './OrdersPanel.css';

const OrdersPanel = ({ orders, onAcceptOrder, currentOrder }) => {
  return (
    <div className="orders-panel">
      <h2>
        <span className="magic-star">✦</span>
        Available Orders
        <span className="magic-star">✦</span>
      </h2>
      <div className="orders-list">
        {orders.map((order, index) => {
          const isActive = currentOrder && currentOrder.potionName === order.potionName && 
            JSON.stringify(currentOrder.requiredIngredients) === JSON.stringify(order.requiredIngredients);
          
          return (
            <Card 
              key={index} 
              className={`order-card ${isActive ? 'active-order' : ''}`}
              style={{
                '--potion-color': order.color,
                borderColor: `${order.color}${isActive ? '66' : '33'} !important`,
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, ${isActive ? '0.1' : '0.05'}), 
                  ${order.color}${isActive ? '22' : '11'}
                ) !important`
              }}
            >
              {isActive && <div className="active-order-badge">In Progress</div>}
              <div 
                className="card-glow"
                style={{
                  background: `radial-gradient(circle at 50% 0%, 
                    ${order.color}${isActive ? '33' : '22'}, 
                    transparent 70%)`
                }}
              ></div>
              <CardBody>
                <CardTitle>
                  <span className="order-icon">⚗</span>
                  Order #{index + 1}
                </CardTitle>
                <CardSubtitle>
                  <span className="potion-icon">🧪</span>
                  Required potion: {order.potionName}
                </CardSubtitle>
                <div className="ingredients-section">
                  <p>
                    <span className="ingredients-icon">📜</span>
                    Required ingredients:
                  </p>
                  <ul className="ingredients-list">
                    {order.requiredIngredients.map((ingredient, i) => (
                      <li key={i}>
                        <span className="ingredient-name">{ingredient.name}</span>
                        <span className="ingredient-amount">({ingredient.amount} ml)</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="reward">
                  <span className="gold-icon">💰</span>
                  Reward: {order.reward} gold
                </p>
              </CardBody>
              <CardActions>
                <Button 
                  themeColor={isActive ? "info" : "success"}
                  onClick={() => !currentOrder && onAcceptOrder(index)}
                  className={`accept-order-btn ${isActive ? 'active' : ''} ${currentOrder ? 'disabled' : ''}`}
                  disabled={currentOrder !== null}
                >
                  <span className="btn-icon">{isActive ? '🔮' : '✨'}</span>
                  {isActive ? 'In Progress' : 'Accept Order'}
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPanel; 