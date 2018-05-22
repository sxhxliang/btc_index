const Base = require('./base.js');
const moment = require('moment');
const superagent = require('superagent');
const superAgent = think.promisify(superagent.get, superagent);

module.exports = class extends Base {
  async indexAction() {
    return this.display();
  }

  async btcindexAction() {
    let address = await superAgent('https://api.blockchain.info/charts/n-unique-addresses?format=json');
    let market = await superAgent('https://api.blockchain.info/charts/market-cap?format=json');

    const indexX = [];
    const indexY = [];
    const indexM = [];
    const indexH = [];

    if (address.status === 200 & market.status === 200) {
      think.logger.debug('ok');

      address = JSON.parse(address.text);
      market = JSON.parse(market.text);
      const addressValues = address.values;
      const marketValues = market.values;

      for (var i = 0; i < addressValues.length; i++) {
        const x = moment.unix(addressValues[i].x).format('YYYY-MM-DD');

        const yA = addressValues[i].y;
        const yM = marketValues[i].y;
        // 【合理市值】=（地址数/1e5）^1.414*1e10
        const yH = Math.pow(yA / 1e5, 1.414) * 1e10;
        const yI = yM / yH * 10;
        indexX.push(x);
        indexY.push(yI);
        indexM.push(yM / 1e8);
        indexH.push(yH / 1e8);
      }
    } else {
      think.logger.debug(address.status, market.status);
    }
    return this.json({ 'index_x': indexX, 'index_y': indexY, 'index_m': indexM, 'index_h': indexH });
  }
};
