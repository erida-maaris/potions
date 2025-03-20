import { Card, CardBody } from '@progress/kendo-react-layout';

import './Header.css';

const Header = ({ gold }) => {
  return (
    <div className="header">
      <Card className="gold-display">
        <CardBody>
          <span className="gold-icon">💰</span>
          <span className="gold-amount">{gold}</span>
        </CardBody>
      </Card>
    </div>
  );
};

export default Header;
