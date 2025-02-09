class SaleController { 
  async create(req, res) { 
    try { 
      res.json({ message: 'Venda realizada com sucesso' }); 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
} 
module.exports = new SaleController(); 
