import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Table,
  InputGroup,
  Dropdown
} from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import InvoiceTemplate from './InvoiceTemplate';

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GSTInvoiceGenerator />} />
        <Route path="/invoice" element={<InvoiceTemplate />} />
      </Routes>
    </Router>
  );
}

function GSTInvoiceGenerator() {
  const navigate = useNavigate();
  
  // State management
  const [items, setItems] = useState([
    { id: '1', description: '', weight: '0', hsnCode: '', quantity: 0, rate: 0, amount: 0 }
  ]);
  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);
  const [igstRate, setIgstRate] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    gstin: '',
    state: '',
    stateCode: '',
  });

  // New state for transportation details
  const [transportationInfo, setTransportationInfo] = useState({
    eWayBill: '',
    transportationMode: '',
    vehicleNo: '',
    state: '',
    stateCode: '',
  });

  // State for cached customer entries
  const [cachedCustomers, setCachedCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // State for cached transportation entries
  const [cachedTransportation, setCachedTransportation] = useState([]);
  const [showTransportationDropdown, setShowTransportationDropdown] = useState(false);

  // Add this right after the other useState declarations in GSTInvoiceGenerator
  const [companyInfo] = useState({
    name: 'SENDHUR TRADERS',
    tagline: 'TRADING OF ALL KINDS OF SCRAPS',
    address: 'Flat No: 4/725,Jai Nagar\nErumapalayam, SALEM - 636 015.',
    gstin: '33CNKPM7002D1ZD',
    state: 'Tamilnadu',
    stateCode: '33',
    phone: "99443 79537 \n 70104 12349"
           
  });
  const [invoiceInfo, setInvoiceInfo] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [subtotal, setSubtotal] = useState(0);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [amountInWords, setAmountInWords] = useState('Rupees Zero Only');

  // Load cached customers and transportation from localStorage when component mounts
  useEffect(() => {
    const savedCustomers = localStorage.getItem('cachedCustomers');
    if (savedCustomers) {
      setCachedCustomers(JSON.parse(savedCustomers));
    }
    
    const savedTransportation = localStorage.getItem('cachedTransportation');
    if (savedTransportation) {
      setCachedTransportation(JSON.parse(savedTransportation));
    }
  }, []);

  // Helper functions
  const calculateAmount = (weight, quantity, rate) => {
    const weightNum = parseFloat(weight) || 0;
    return weightNum * quantity * rate;
  };

  const calculateAutoRoundOff = () => {
    const initialTotal = subtotal + totalTax;
    const roundedTotal = Math.round(initialTotal);
    return roundedTotal - initialTotal;
  };

  // Convert number to words function
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];
    
    if (num === 0) return 'Zero';
    
    // For decimal handling
    let rupees = Math.floor(num);
    let paise = Math.round((num - rupees) * 100);
    
    function convertGroupOfDigits(num) {
      if (num === 0) return '';
      else if (num < 20) return ones[num];
      else if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
      else return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertGroupOfDigits(num % 100) : '');
    }
    
    let words = '';
    let digits = 0;
    
    // Handle crores (1,00,00,000)
    digits = Math.floor(rupees / 10000000) % 100;
    if (digits > 0) words += convertGroupOfDigits(digits) + ' ' + scales[3] + ' ';
    
    // Handle lakhs (1,00,000)
    digits = Math.floor(rupees / 100000) % 100;
    if (digits > 0) words += convertGroupOfDigits(digits) + ' ' + scales[2] + ' ';
    
    // Handle thousands (1,000)
    digits = Math.floor(rupees / 1000) % 100;
    if (digits > 0) words += convertGroupOfDigits(digits) + ' ' + scales[1] + ' ';
    
    // Handle hundreds, tens, and ones
    digits = rupees % 1000;
    if (digits > 0) words += convertGroupOfDigits(digits);
    
    // Add rupees text
    words = words.trim() + ' Rupees';
    
    // Add paise if any
    if (paise > 0) {
      words += ' and ' + convertGroupOfDigits(paise) + ' Paise';
    }
    
    return words + ' Only';
  };

  // Handle customer and invoice info changes
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo({
      ...customerInfo,
      [field]: value
    });
  };

  // Handle transportation info changes
  const handleTransportationInfoChange = (field, value) => {
    setTransportationInfo({
      ...transportationInfo,
      [field]: value
    });
  };

  const handleInvoiceInfoChange = (field, value) => {
    setInvoiceInfo({
      ...invoiceInfo,
      [field]: value
    });
  };

  // Save current customer to cache
  const saveCustomerToCache = () => {
    // Only save if at least customer name is provided
    if (customerInfo.name.trim()) {
      // Check if customer already exists in cache
      const existingCustomerIndex = cachedCustomers.findIndex(
        customer => customer.name === customerInfo.name
      );

      let updatedCachedCustomers = [...cachedCustomers];
      
      if (existingCustomerIndex >= 0) {
        // Update existing customer
        updatedCachedCustomers[existingCustomerIndex] = {...customerInfo};
      } else {
        // Add new customer
        updatedCachedCustomers = [...cachedCustomers, {...customerInfo}];
      }
      
      // Update state and localStorage
      setCachedCustomers(updatedCachedCustomers);
      localStorage.setItem('cachedCustomers', JSON.stringify(updatedCachedCustomers));
      
      alert("Customer details saved to cache!");
    } else {
      alert("Please enter at least the customer name before saving");
    }
  };

  // Save current transportation to cache
  const saveTransportationToCache = () => {
    // Only save if at least vehicle number is provided
    if (transportationInfo.vehicleNo.trim()) {
      // Check if transportation already exists in cache
      const existingTransportationIndex = cachedTransportation.findIndex(
        transportation => transportation.vehicleNo === transportationInfo.vehicleNo
      );

      let updatedCachedTransportation = [...cachedTransportation];
      
      if (existingTransportationIndex >= 0) {
        // Update existing transportation
        updatedCachedTransportation[existingTransportationIndex] = {...transportationInfo};
      } else {
        // Add new transportation
        updatedCachedTransportation = [...cachedTransportation, {...transportationInfo}];
      }
      
      // Update state and localStorage
      setCachedTransportation(updatedCachedTransportation);
      localStorage.setItem('cachedTransportation', JSON.stringify(updatedCachedTransportation));
      
      alert("Transportation details saved to cache!");
    } else {
      alert("Please enter at least the vehicle number before saving");
    }
  };

  // Handle selecting customer from dropdown
  const selectCustomer = (customer) => {
    setCustomerInfo(customer);
    setShowCustomerDropdown(false);
  };

  // Handle selecting transportation from dropdown
  const selectTransportation = (transportation) => {
    setTransportationInfo(transportation);
    setShowTransportationDropdown(false);
  };

  // Handle clear customer cache
  const clearCustomerCache = () => {
    if (window.confirm("Are you sure you want to clear all cached customers?")) {
      setCachedCustomers([]);
      localStorage.removeItem('cachedCustomers');
      alert("Customer cache cleared successfully");
    }
  };

  // Handle clear transportation cache
  const clearTransportationCache = () => {
    if (window.confirm("Are you sure you want to clear all cached transportation details?")) {
      setCachedTransportation([]);
      localStorage.removeItem('cachedTransportation');
      alert("Transportation cache cleared successfully");
    }
  };

  // Handle item changes
  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'weight' || field === 'quantity' || field === 'rate') {
          const weight = field === 'weight' ? value : item.weight;
          const quantity = field === 'quantity' ? Number(value) : item.quantity;
          const rate = field === 'rate' ? Number(value) : item.rate;
          
          updatedItem.amount = calculateAmount(weight, quantity, rate);
        }
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  // Add new item
  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      weight: '0',
      hsnCode: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Apply auto round off
  const applyAutoRoundOff = () => {
    const calculatedRoundOff = calculateAutoRoundOff();
    setRoundOff(calculatedRoundOff);
  };

  const generateInvoice = () => {
    // Validation
    if (!customerInfo.name) {
      alert('Please enter customer name');
      return;
    }
    
    if (!invoiceInfo.number) {
      alert('Please enter invoice number');
      return;
    }
    
    if (items.length === 0 || subtotal === 0) {
      alert('Please add at least one item with quantity and rate');
      return;
    }
    
    // Save current customer to cache automatically when generating invoice
    const existingCustomerIndex = cachedCustomers.findIndex(
      customer => customer.name === customerInfo.name
    );
    
    if (existingCustomerIndex === -1 && customerInfo.name.trim()) {
      const updatedCachedCustomers = [...cachedCustomers, {...customerInfo}];
      setCachedCustomers(updatedCachedCustomers);
      localStorage.setItem('cachedCustomers', JSON.stringify(updatedCachedCustomers));
    }

    // Save current transportation to cache automatically when generating invoice
    const existingTransportationIndex = cachedTransportation.findIndex(
      transportation => transportation.vehicleNo === transportationInfo.vehicleNo
    );
    
    if (existingTransportationIndex === -1 && transportationInfo.vehicleNo.trim()) {
      const updatedCachedTransportation = [...cachedTransportation, {...transportationInfo}];
      setCachedTransportation(updatedCachedTransportation);
      localStorage.setItem('cachedTransportation', JSON.stringify(updatedCachedTransportation));
    }
    
    // Collect all invoice data
    const invoiceData = {
      // Company details (add this)
      companyName: companyInfo.name,
      companyTagline: companyInfo.tagline,
      companyAddress: companyInfo.address,
      companyGstin: companyInfo.gstin,
      companyState: companyInfo.state,
      companyStateCode: companyInfo.stateCode,
      companyPhone: companyInfo.phone,
      
      // Customer details
      customerName: customerInfo.name,
      customerAddress: customerInfo.address,
      customerGstin: customerInfo.gstin,
      customerState: customerInfo.state,
      customerStateCode: customerInfo.stateCode,
      
      // Transportation details
      customerEwayBill: transportationInfo.eWayBill,
      customerTransportationMode: transportationInfo.transportationMode,
      customerVehicleNo: transportationInfo.vehicleNo,
      customerTransportationState: transportationInfo.state,
      customerTransportationStateCode: transportationInfo.stateCode,
      
      // Invoice details
      invoiceNumber: invoiceInfo.number,
      invoiceDate: invoiceInfo.date,
      
      // Items
      items: items,
      
      // Tax details
      cgstRate,
      sgstRate,
      igstRate,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      roundOff,
      grandTotal,
      
      // Amount in words
      amountInWords
    };
    
    // Store invoice data in localStorage to access it from the template
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    
    // Navigate to the invoice template page
    navigate('/invoice');
  };
  useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const calculatedCgstAmount = (calculatedSubtotal * cgstRate) / 100;
    const calculatedSgstAmount = (calculatedSubtotal * sgstRate) / 100;
    const calculatedIgstAmount = (calculatedSubtotal * igstRate) / 100;
    const calculatedTotalTax = calculatedCgstAmount + calculatedSgstAmount + calculatedIgstAmount;
    const calculatedGrandTotal = calculatedSubtotal + calculatedTotalTax + roundOff;
    
    setSubtotal(calculatedSubtotal);
    setCgstAmount(calculatedCgstAmount);
    setSgstAmount(calculatedSgstAmount);
    setIgstAmount(calculatedIgstAmount);
    setTotalTax(calculatedTotalTax);
    setGrandTotal(calculatedGrandTotal);
    
    // Update amount in words
    setAmountInWords(numberToWords(calculatedGrandTotal));
  }, [items, cgstRate, sgstRate, igstRate, roundOff]);

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">GST Invoice</h2>
      
      {/* Header Grid - Customer and Transportation Info */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h5" className="d-flex justify-content-between align-items-center">
                <span>Details of Receiver / Billed to</span>
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  >
                    {showCustomerDropdown ? "Hide List" : "Show List"}
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={saveCustomerToCache}
                  >
                    Save
                  </Button>
                </div>
              </Card.Title>
              
              {showCustomerDropdown && (
                <div className="mb-3">
                  <div className="mb-2">
                    <strong>Cached Customers:</strong>
                    {cachedCustomers.length === 0 && (
                      <span className="ms-2 text-muted">No saved customers</span>
                    )}
                  </div>
                  
                  <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                    {cachedCustomers.map((customer, index) => (
                      <div 
                        key={index} 
                        className="p-2 border-bottom customer-item" 
                        onClick={() => selectCustomer(customer)}
                        style={{cursor: 'pointer'}}
                      >
                        <strong>{customer.name}</strong>
                        {customer.gstin && <div><small>GSTIN: {customer.gstin}</small></div>}
                      </div>
                    ))}
                    
                    {cachedCustomers.length > 0 && (
                      <div className="pt-2 d-flex justify-content-end">
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={clearCustomerCache}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <Form>
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>Name:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter customer name"
                      value={customerInfo.name}
                      onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>Address:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      placeholder="Enter customer address"
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>GSTIN:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter GSTIN"
                      value={customerInfo.gstin}
                      onChange={(e) => handleCustomerInfoChange('gstin', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>State:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter state"
                      value={customerInfo.state}
                      onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col sm={4}>
                    <Form.Label>State Code:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter state code"
                      value={customerInfo.stateCode}
                      onChange={(e) => handleCustomerInfoChange('stateCode', e.target.value)}
                    />
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h5" className="d-flex justify-content-between align-items-center">
                <span>Details of Transportation</span>
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => setShowTransportationDropdown(!showTransportationDropdown)}
                  >
                    {showTransportationDropdown ? "Hide List" : "Show List"}
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={saveTransportationToCache}
                  >
                    Save
                  </Button>
                </div>
              </Card.Title>
              
              {showTransportationDropdown && (
                <div className="mb-3">
                  <div className="mb-2">
                    <strong>Cached Transportation:</strong>
                    {cachedTransportation.length === 0 && (
                      <span className="ms-2 text-muted">No saved transportation details</span>
                    )}
                  </div>
                  
                  <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                    {cachedTransportation.map((transportation, index) => (
                      <div 
                        key={index} 
                        className="p-2 border-bottom transportation-item" 
                        onClick={() => selectTransportation(transportation)}
                        style={{cursor: 'pointer'}}
                      >
                        <strong>{transportation.vehicleNo}</strong>
                        {transportation.transportationMode && <div><small>Mode: {transportation.transportationMode}</small></div>}
                        {transportation.eWayBill && <div><small>E-Way: {transportation.eWayBill}</small></div>}
                      </div>
                    ))}
                    
                    {cachedTransportation.length > 0 && (
                      <div className="pt-2 d-flex justify-content-end">
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={clearTransportationCache}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <Form>
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>E-Way No:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter E-Way No"
                      value={transportationInfo.eWayBill}
                      onChange={(e) => handleTransportationInfoChange('eWayBill', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>Transportation Mode:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text"
                      placeholder="Enter Transportation Mode"
                      value={transportationInfo.transportationMode}
                      onChange={(e) => handleTransportationInfoChange('transportationMode', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>Vehicle No:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter Vehicle No"
                      value={transportationInfo.vehicleNo}
                      onChange={(e) => handleTransportationInfoChange('vehicleNo', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>State:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter state"
                      value={transportationInfo.state}
                      onChange={(e) => handleTransportationInfoChange('state', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col sm={4}>
                    <Form.Label>State Code:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter state code"
                      value={transportationInfo.stateCode}
                      onChange={(e) => handleTransportationInfoChange('stateCode', e.target.value)}
                    />
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invoice Details */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h5">Invoice Details</Card.Title>
              <Form>
                <Row className="mb-2">
                  <Col sm={4}>
                    <Form.Label>Invoice No:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter invoice number"
                      value={invoiceInfo.number}
                      onChange={(e) => handleInvoiceInfoChange('number', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col sm={4}>
                    <Form.Label>Invoice Date:</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Control 
                      type="date"
                      value={invoiceInfo.date}
                      onChange={(e) => handleInvoiceInfoChange('date', e.target.value)}
                    />
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Invoice Items Table */}
      <div className="mb-3">
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Product Description</th>
              <th>Weight</th>
              <th>HSN Code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <Form.Control
                    type="text"
                    value={item.description}
                    placeholder="Enter product description"
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={item.weight}
                    placeholder="Enter weight"
                    onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={item.hsnCode}
                    placeholder="Enter HSN code"
                    onChange={(e) => handleItemChange(item.id, 'hsnCode', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={item.quantity || ''}
                    placeholder="Qty"
                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={item.rate || ''}
                    placeholder="Rate"
                    onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                  />
                </td>
                <td className="text-end">₹{item.amount.toFixed(2)}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <div className="mb-4">
        <Button variant="primary" onClick={addItem}>Add Item</Button>
      </div>
      
      {/* Lower Section - GST Details and Summary */}
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title as="h5">GST Details</Card.Title>
              
              <Form.Group as={Row} className="mb-2">
                <Form.Label column sm={4}>CGST Rate (%):</Form.Label>
                <Col sm={3}>
                  <Form.Control 
                    type="number" 
                    value={cgstRate}
                    onChange={(e) => setCgstRate(Number(e.target.value))}
              
                  />
                </Col>
                <Col sm={5}>
                  <Form.Text>Amount: ₹{cgstAmount.toFixed(2)}</Form.Text>
                </Col>
              </Form.Group>
              
             
              <Form.Group as={Row} className="mb-2">
                <Form.Label column sm={4}>SGST Rate (%):</Form.Label>
                <Col sm={3}>
                  <Form.Control 
                    type="number" 
                    value={sgstRate}
                    onChange={(e) => setSgstRate(Number(e.target.value))}
                  />
                </Col>
                <Col sm={5}>
                  <Form.Text>Amount: ₹{sgstAmount.toFixed(2)}</Form.Text>
                </Col>
              </Form.Group>

               <Form.Group as={Row} className="mb-2">
                <Form.Label column sm={4}>IGST Rate (%):</Form.Label>
                <Col sm={3}>
                  <Form.Control 
                    type="number" 
                    value={igstRate}
                    onChange={(e) => setIgstRate(Number(e.target.value))}
                  />
                </Col>
                <Col sm={5}>
                  <Form.Text>Amount: ₹{igstAmount.toFixed(2)}</Form.Text>
                </Col>
              </Form.Group>
              
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={4}>Total Tax:</Form.Label>
                <Col sm={8}>
                  <Form.Text className="fw-bold">₹{totalTax.toFixed(2)}</Form.Text>
                </Col>
              </Form.Group>
              
              <Form.Group as={Row}>
                <Form.Label column sm={4}>Round Off:</Form.Label>
                <Col sm={3}>
                  <Form.Control 
                    type="number" 
                    value={roundOff}
                    step="0.01"
                    onChange={(e) => setRoundOff(Number(e.target.value))}
                  />
                </Col>
                <Col sm={5}>
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={applyAutoRoundOff}
                  >
                    Auto-round
                  </Button>
                </Col>
              </Form.Group>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title as="h5">Total in Words</Card.Title>
              <div className="bg-light p-2 fst-bold rounded">
                {amountInWords}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-medium">Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-medium">CGST:</span>
                <span>₹{cgstAmount.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-medium">SGST:</span>
                <span>₹{sgstAmount.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-medium">IGST:</span>
                <span>₹{igstAmount.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="fw-medium">Round Off:</span>
                <span>₹{roundOff.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between py-3">
                <span className="fw-bold fs-5">Grand Total:</span>
                <span className="fw-bold fs-5">₹{grandTotal.toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Generate Button */}
      <div className="d-flex justify-content-center mt-4">
        <Button 
          variant="success" 
          size="lg" 
          onClick={generateInvoice}
        >
          Generate Invoice
        </Button>
      </div>
    </Container>
  );
}

export default App;