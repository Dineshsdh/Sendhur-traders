import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// (The InvoicePDF component and its styles remain exactly the same as before)
// ... styles definition ...
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 10,
    objectFit: 'contain',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    width: '60%',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'column',
    width: '40%',
    alignItems: 'flex-end',
  },
  headerText: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#0d6efd',
  },
  companyTagline: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  taxInvoice: {
    fontSize: 12,
    fontWeight: 'bold',
    border: '1px solid black',
    padding: 3,
    textAlign: 'center',
    marginBottom: 5,
  },
  phoneNumber: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 3,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoBox: {
    width: '48%',
    border: '1px solid #dee2e6',
    borderRadius: 4,
  },
  infoHeader: {
    backgroundColor: '#f8f9fa',
    padding: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    fontWeight: 'bold',
  },
  infoBody: {
    padding: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 3,
    width: '30%',
  },
  infoValue: {
    width: '70%',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  tableCol: {
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  colSNo: { width: '5%' },
  colDesc: { width: '35%' },
  colHSN: { width: '10%' },
  colWeight: { width: '10%' },
  colQty: { width: '10%' },
  colRate: { width: '15%' },
  colAmount: { width: '15%' },
  amountWords: {
    fontStyle: 'italic',
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 3,
  },
  bankDetails: {
    marginVertical: 5,
  },
  bankItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingVertical: 2,
  },
  termsTitle: {
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 3,
  },
  termItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingVertical: 2,
  },
  signature: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 3,
  }
});

const InvoicePDF = ({ invoiceData, invoiceType }) => {
  const branchTransferAddress = "264, T.V.NAGAR, VELLAKOIL, Vellakoil, Tiruppur, Tamil Nadu, 638111";
  
  const {
    companyName = "SENDHUR TRADERS",
    companyTagline = "TRADING OF ALL KINDS OF SCRAPS",
    companyAddress = "Flat No:4/725, Jai Nagar,\nErumapalayam, SALEM - 636 015.",
    companyPhone = "99443 79537,\n 70104 12349",
    companyGstin = "33CNKPM7002D1ZD",
    companyState = "Tamilnadu",
    companyStateCode = "33",
    companyLogo = null,
    customerName = '',
    customerAddress = '',
    customerGstin = '',
    customerState = '',
    customerStateCode = '',
    customerEwayBill = '',
    customerTransportationMode = '',
    customerVehicleNo = '',
    customerTransportationState = '',
    customerTransportationStateCode = '',
    invoiceNumber = '',
    invoiceDate = '',
    items = [],
    cgstRate = 0,
    sgstRate = 0,
    igstRate = 0,
    subtotal = 0,
    cgstAmount = 0,
    sgstAmount = 0,
    igstAmount = 0,
    roundOff = 0,
    grandTotal = 0,
    amountInWords = '',
    signatureImage = null
  } = invoiceData;
  
  const displayAddress = invoiceType === 'BRANCH TRANSFER' ? branchTransferAddress : companyAddress;
  const addressLines = displayAddress.split('\n');
  const phoneLines = companyPhone.split('\n');
  const emptyRowsNeeded = Math.max(0, 8 - items.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {companyLogo && <Image src={companyLogo} style={styles.logo} />}
            <View style={styles.headerText}>
              <Text style={styles.companyName}>{companyName}</Text>
              <Text style={styles.companyTagline}>{companyTagline}</Text>
              {addressLines.map((line, i) => (<Text key={i}>{line}</Text>))}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.taxInvoice}>{invoiceType}</Text>
            <View style={styles.phoneNumber}>
              <Text>Cell:</Text>
              {phoneLines.map((line, i) => (<Text key={i}>{line}</Text>))}
            </View>
          </View>
        </View>
        <View style={styles.infoSection}>
          <View style={{ width: '60%' }}>
            <Text><Text style={{ fontWeight: 'bold' }}>GSTIN:</Text> {companyGstin}</Text>
            <View style={styles.row}>
              <Text style={{ marginRight: 10 }}><Text style={{ fontWeight: 'bold' }}>Reverse Charge:</Text> No</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>State:</Text> {companyState}</Text>
            </View>
            <Text><Text style={{ fontWeight: 'bold' }}>State Code:</Text> {companyStateCode}</Text>
          </View>
          <View style={{ width: '40%', alignItems: 'flex-end' }}>
            <Text><Text style={{ fontWeight: 'bold' }}>Invoice No:</Text> {invoiceNumber}</Text>
            <Text><Text style={{ fontWeight: 'bold' }}>Invoice Date:</Text> {invoiceDate}</Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}><Text>Details of Receiver / Billed to:</Text></View>
            <View style={styles.infoBody}>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Name:</Text><Text style={styles.infoValue}>{customerName}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Address:</Text><Text style={styles.infoValue}>{customerAddress}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>GSTIN:</Text><Text style={styles.infoValue}>{customerGstin}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>State:</Text><Text style={styles.infoValue}>{customerState}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>State Code:</Text><Text style={styles.infoValue}>{customerStateCode}</Text></View>
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}><Text>Details of Transportation:</Text></View>
            <View style={styles.infoBody}>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>E-Way No:</Text><Text style={styles.infoValue}>{customerEwayBill}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Mode:</Text><Text style={styles.infoValue}>{customerTransportationMode}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Vehicle No:</Text><Text style={styles.infoValue}>{customerVehicleNo}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>State:</Text><Text style={styles.infoValue}>{customerTransportationState}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>State Code:</Text><Text style={styles.infoValue}>{customerTransportationStateCode}</Text></View>
            </View>
          </View>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, styles.colSNo]}><Text>S. No.</Text></View>
            <View style={[styles.tableCol, styles.colDesc]}><Text>Product Description</Text></View>
            <View style={[styles.tableCol, styles.colHSN]}><Text>HSN Code</Text></View>
            <View style={[styles.tableCol, styles.colWeight]}><Text>Weight</Text></View>
            <View style={[styles.tableCol, styles.colQty]}><Text>Qty</Text></View>
            <View style={[styles.tableCol, styles.colRate]}><Text>Rate</Text></View>
            <View style={[styles.tableCol, styles.colAmount]}><Text>Amount</Text></View>
          </View>
          {items.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colSNo]}><Text>{index + 1}</Text></View>
              <View style={[styles.tableCol, styles.colDesc]}><Text>{item.description}</Text></View>
              <View style={[styles.tableCol, styles.colHSN]}><Text>{item.hsnCode}</Text></View>
              <View style={[styles.tableCol, styles.colWeight]}><Text>{item.weight || ''}</Text></View>
              <View style={[styles.tableCol, styles.colQty]}><Text>{item.quantity}</Text></View>
              <View style={[styles.tableCol, styles.colRate]}><Text>{(item.rate || 0).toFixed(2)}</Text></View>
              <View style={[styles.tableCol, styles.colAmount]}><Text>{(item.amount || 0).toFixed(2)}</Text></View>
            </View>
          ))}
          {Array.from({ length: emptyRowsNeeded }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colSNo]}><Text> </Text></View>
              <View style={[styles.tableCol, styles.colDesc]}><Text> </Text></View>
              <View style={[styles.tableCol, styles.colHSN]}><Text> </Text></View>
              <View style={[styles.tableCol, styles.colWeight]}><Text> </Text></View>
              <View style={[styles.tableCol, styles.colQty]}><Text> </Text></View>
              <View style={[styles.tableCol, styles.colRate]}><Text> </Text></View>
              <View style={[styles.tableCol, styles.colAmount]}><Text> </Text></View>
            </View>
          ))}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '85%' }]}><Text style={{ fontWeight: 'bold', textAlign: 'right' }}>TOTAL BEFORE TAX</Text></View>
            <View style={[styles.tableCol, styles.colAmount]}><Text style={{ fontWeight: 'bold' }}>{subtotal.toFixed(2)}</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 5, flexGrow: 1 }}>
          <View style={{ width: '50%', paddingRight: 5, display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Total Invoice amount in words:</Text>
            <Text style={styles.amountWords}>{amountInWords}</Text>
            <View style={styles.bankDetails}>
              <Text style={{ fontWeight: 'bold', fontSize: 9 }}>Bank Details:</Text>
              <View style={styles.bankItem}><Text style={{ fontSize: 9 }}>Bank Name: KARUR VYSYA BANK</Text></View>
              <View style={styles.bankItem}><Text style={{ fontSize: 9 }}>Bank A/c No: 1653135000002902</Text></View>
              <View style={styles.bankItem}><Text style={{ fontSize: 9 }}>Bank Branch IFSC Code: KVBL0001653</Text></View>
            </View>
            <Text style={styles.termsTitle}>Terms and Conditions:</Text>
            <View style={styles.termItem}><Text style={{ fontSize: 8 }}>Interest @ 24% p.a. will be charged if bill is not paid within 30 days.</Text></View>
            <View style={styles.termItem}><Text style={{ fontSize: 8 }}>Subject to Salem Jurisdiction.</Text></View>
          </View>
          <View style={{ width: '50%', paddingLeft: 5, display: 'flex', flexDirection: 'column' }}>
            <View style={styles.table}>
              <View style={styles.tableRow}><View style={[styles.tableCol, { width: '70%' }]}><Text>Add: CGST @ {cgstRate}%</Text></View><View style={[styles.tableCol, { width: '30%' }]}><Text style={{ textAlign: 'right' }}>{cgstAmount.toFixed(2)}</Text></View></View>
              <View style={styles.tableRow}><View style={[styles.tableCol, { width: '70%' }]}><Text>Add: SGST @ {sgstRate}%</Text></View><View style={[styles.tableCol, { width: '30%' }]}><Text style={{ textAlign: 'right' }}>{sgstAmount.toFixed(2)}</Text></View></View>
              <View style={styles.tableRow}><View style={[styles.tableCol, { width: '70%' }]}><Text>Add: IGST @ {igstRate}%</Text></View><View style={[styles.tableCol, { width: '30%' }]}><Text style={{ textAlign: 'right' }}>{igstAmount.toFixed(2)}</Text></View></View>
              <View style={styles.tableRow}><View style={[styles.tableCol, { width: '70%' }]}><Text>Total Tax Amount</Text></View><View style={[styles.tableCol, { width: '30%' }]}><Text style={{ textAlign: 'right' }}>{(cgstAmount + sgstAmount + igstAmount).toFixed(2)}</Text></View></View>
              <View style={styles.tableRow}><View style={[styles.tableCol, { width: '70%' }]}><Text>Round Off {roundOff >= 0 ? '(+)' : '(-)'}</Text></View><View style={[styles.tableCol, { width: '30%' }]}><Text style={{ textAlign: 'right' }}>{Math.abs(roundOff).toFixed(2)}</Text></View></View>
              <View style={styles.tableRow}><View style={[styles.tableCol, { width: '70%', fontWeight: 'bold' }]}><Text>Total Amount After Tax</Text></View><View style={[styles.tableCol, { width: '30%' }]}><Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{grandTotal.toFixed(2)}</Text></View></View>
            </View>
            <View style={styles.signature}>
              <Text style={{ fontSize: 9 }}>Certified that the particulars given above are true and correct</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 9, marginTop: 5 }}>For SENDHUR TRADERS</Text>
              <View style={{ marginTop: 25 }}>
                {signatureImage ? 
                  <Image src={signatureImage} style={{ width: 120, height: 50, objectFit: 'contain' }} /> : 
                  <View style={styles.signatureLine} />
                }
                <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 5 }}>Authorised Signatory</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};


function InvoiceTemplate() {
  const [invoiceData, setInvoiceData] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [invoiceType, setInvoiceType] = useState('TAX INVOICE');
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('invoiceData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setInvoiceData(parsedData);
      } catch (error) {
        console.error("Failed to parse invoice data:", error);
        alert('Invalid invoice data found in storage!');
        navigate('/');
      }
    } else {
      alert('No invoice data found!');
      navigate('/');
    }
    
    const savedSignature = localStorage.getItem('signatureImage');
    if (savedSignature) setSignatureImage(savedSignature);
    
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) setCompanyLogo(savedLogo);
  }, [navigate]);
  
  const handleImageUpload = (e, setImage, storageKey) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setImage(base64Image);
        localStorage.setItem(storageKey, base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!invoiceData) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading invoice data...</p>
      </Container>
    );
  }
  
  const invoiceDataWithImages = {
    ...invoiceData,
    signatureImage: signatureImage,
    companyLogo: companyLogo
  };
  
  const branchTransferAddress = "264, T.V.NAGAR, VELLAKOIL, Vellakoil, Tiruppur, Tamil Nadu, 638111";
  const displayAddress = invoiceType === 'BRANCH TRANSFER' ? branchTransferAddress : (invoiceData.companyAddress || "");
  
  return (
    <Container fluid className="p-3 bg-light">
      {/* Controls */}
      <Card className="mb-3 print-hide">
        <Card.Body className="d-flex justify-content-center align-items-center flex-wrap gap-2">
          <Button variant="primary" onClick={() => window.print()}>🖨️ Print Invoice</Button>
          
          {/* ======================= FIX: Added a key prop here ======================= */}
          <PDFDownloadLink 
            key={invoiceType} // This key forces the component to re-render when invoiceType changes
            document={<InvoicePDF invoiceData={invoiceDataWithImages} invoiceType={invoiceType} />} 
            fileName={`${invoiceType.replace(' ', '-')}-${invoiceData.invoiceNumber || 'details'}.pdf`}
            className="btn btn-success"
          >
            {({ loading }) => (loading ? 'Generating PDF...' : '📄 Download PDF')}
          </PDFDownloadLink>
          {/* =============================== End of FIX =============================== */}

          <Button variant="secondary" onClick={() => navigate('/')}>✏️ Back to Editor</Button>
          
          <Button as="label" variant="info" htmlFor="signatureUpload" className="text-white">
            {signatureImage ? "Change Signature" : "Add Signature"}
            <input id="signatureUpload" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setSignatureImage, 'signatureImage')} className="d-none" />
          </Button>
          
          <Button as="label" variant="warning" htmlFor="logoUpload" className="text-dark">
            {companyLogo ? "Change Logo" : "Add Logo"}
            <input id="logoUpload" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCompanyLogo, 'companyLogo')} className="d-none" />
          </Button>
        </Card.Body>
      </Card>

      {/* Invoice Template */}
      <div 
        id="printableInvoice"
        className="mx-auto border p-4 bg-white shadow-sm"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <header className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
          <div className="d-flex align-items-center">
            {companyLogo && <img src={companyLogo} alt="Logo" style={{ width: '80px', height: '80px', marginRight: '15px', objectFit: 'contain' }} />}
            <div>
              <h2 className="text-primary mb-0">{invoiceData.companyName || "SENDHUR TRADERS"}</h2>
              <p className="fw-bold mb-0">{invoiceData.companyTagline || "TRADING OF ALL KINDS OF SCRAPS"}</p>
              {displayAddress.split('\n').map((line, i) => (<p key={i} className="mb-0 small">{line}</p>))}
            </div>
          </div>
          <div className="text-end">
            <select className="form-select form-select-sm mb-2" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="BRANCH TRANSFER">BRANCH TRANSFER</option>
            </select>
            {(invoiceData.companyPhone || "").split('\n').map((line, i) => (<p key={i} className="mb-0 small"><strong>{i === 0 && 'Cell: '}</strong>{line}</p>))}
          </div>
        </header>
        
        <Row className="mb-3 small">
          <Col md={7}>
            <p className="mb-1"><strong>GSTIN:</strong> {invoiceData.companyGstin || ""}</p>
            <p className="mb-1"><strong>Reverse Charge:</strong> No</p>
            <p className="mb-1"><strong>State:</strong> {invoiceData.companyState || ""} (Code: {invoiceData.companyStateCode || ""})</p>
          </Col>
          <Col md={5} className="text-end">
            <p className="mb-1"><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
            <p className="mb-1"><strong>Invoice Date:</strong> {invoiceData.invoiceDate}</p>
          </Col>
        </Row>

        <Row className="mb-3 small">
          <Col md={6}><Card className="h-100"><Card.Header>Billed to:</Card.Header><Card.Body>
            <p className="mb-1"><strong>Name:</strong> {invoiceData.customerName}</p>
            <p className="mb-1"><strong>Address:</strong> {invoiceData.customerAddress}</p>
            <p className="mb-1"><strong>GSTIN:</strong> {invoiceData.customerGstin}</p>
            <p className="mb-0"><strong>State:</strong> {invoiceData.customerState} (Code: {invoiceData.customerStateCode})</p>
          </Card.Body></Card></Col>
          <Col md={6}><Card className="h-100"><Card.Header>Transportation Details:</Card.Header><Card.Body>
            <p className="mb-1"><strong>E-Way No:</strong> {invoiceData.customerEwayBill}</p>
            <p className="mb-1"><strong>Mode:</strong> {invoiceData.customerTransportationMode}</p>
            <p className="mb-1"><strong>Vehicle No:</strong> {invoiceData.customerVehicleNo}</p>
            <p className="mb-0"><strong>State:</strong> {invoiceData.customerTransportationState} (Code: {invoiceData.customerTransportationStateCode})</p>
          </Card.Body></Card></Col>
        </Row>
        
        <Table bordered responsive className="mb-3 small">
          <thead className="table-light"><tr>
            <th>S.No</th><th>Product Description</th><th>HSN</th><th>Weight</th><th>Qty</th><th>Rate</th><th>Amount</th>
          </tr></thead>
          <tbody>
            {(invoiceData.items || []).map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td><td>{item.description}</td><td>{item.hsnCode}</td><td>{item.weight || ''}</td>
                <td>{item.quantity}</td><td>₹{(item.rate || 0).toFixed(2)}</td><td>₹{(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - (invoiceData.items || []).length) }).map((_, i) => (
              <tr key={`empty-${i}`}><td colSpan="7">&nbsp;</td></tr>
            ))}
            <tr><th colSpan={6} className="text-end">TOTAL BEFORE TAX</th><th>₹{(invoiceData.subtotal || 0).toFixed(2)}</th></tr>
          </tbody>
        </Table>
        
        <Row className="small">
          <Col md={6}>
            <p className="mb-1"><strong>Amount in words:</strong><br /><i className="border-bottom d-block pb-1">{invoiceData.amountInWords}</i></p>
            <div className="mt-2">
              <p className="fw-bold mb-1">Bank Details:</p>
              <p className="mb-1 border-bottom pb-1"><strong>Bank:</strong> KARUR VYSYA BANK</p>
              <p className="mb-1 border-bottom pb-1"><strong>A/c No:</strong> 1653135000002902</p>
              <p className="mb-1 border-bottom pb-1"><strong>IFSC:</strong> KVBL0001653</p>
            </div>
          </Col>
          <Col md={6}>
            <Table bordered size="sm"><tbody>
              <tr><td>Add: CGST @ {invoiceData.cgstRate || 0}%</td><td className="text-end">₹{(invoiceData.cgstAmount || 0).toFixed(2)}</td></tr>
              <tr><td>Add: SGST @ {invoiceData.sgstRate || 0}%</td><td className="text-end">₹{(invoiceData.sgstAmount || 0).toFixed(2)}</td></tr>
              <tr><td>Add: IGST @ {invoiceData.igstRate || 0}%</td><td className="text-end">₹{(invoiceData.igstRate || 0).toFixed(2)}</td></tr>
              <tr><td>Total Tax</td><td className="text-end">₹{((invoiceData.cgstAmount || 0) + (invoiceData.sgstAmount || 0) + (invoiceData.igstAmount || 0)).toFixed(2)}</td></tr>
              <tr><td>Round Off { (invoiceData.roundOff || 0) >= 0 ? '(+)' : '(-)'}</td><td className="text-end">₹{Math.abs(invoiceData.roundOff || 0).toFixed(2)}</td></tr>
              <tr className="fw-bold table-light"><td>Total Amount</td><td className="text-end">₹{(invoiceData.grandTotal || 0).toFixed(2)}</td></tr>
            </tbody></Table>
            <div className="mt-3 text-center">
              <p className="mb-1">For {invoiceData.companyName || ""}</p>
              {signatureImage ? 
                <img src={signatureImage} alt="Signature" style={{ height: '50px', marginTop: '10px' }} /> :
                <div style={{ height: '60px' }}></div>
              }
              <p className="border-top mt-1 pt-1">Authorised Signatory</p>
            </div>
          </Col>
        </Row>
      </div>
      
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          #printableInvoice {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </Container>
  );
}

export default InvoiceTemplate;