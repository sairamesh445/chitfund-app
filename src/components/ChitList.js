import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrencyWithRupee, testRupeeSupport } from '../utils/pdfFonts';
import { loadRupeeFont } from '../utils/rupeeFont';

// Helper function to convert number to words (for amount in words)
// const numberToWords = (num) => {
//   // Implementation of number to words conversion
//   // This is a simplified version - you might want to use a library for production
//   const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//   const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
//   const formatTens = (num) => {
//     if (num < 10) return single[num];
//     if (num < 20) return double[num - 10];
//     return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + single[num % 10] : '');
//   };

//   if (num === 0) return 'Zero';
  
//   let result = '';
//   if (num >= 10000000) {
//     result += formatTens(Math.floor(num / 10000000)) + ' Crore ';
//     num %= 10000000;
//   }
//   if (num >= 100000) {
//     result += formatTens(Math.floor(num / 100000)) + ' Lakh ';
//     num %= 100000;
//   }
//   if (num >= 1000) {
//     result += formatTens(Math.floor(num / 1000)) + ' Thousand ';
//     num %= 1000;
//   }
//   if (num >= 100) {
//     result += single[Math.floor(num / 100)] + ' Hundred ';
//     num %= 100;
//   }
//   if (num > 0) {
//     result += formatTens(num);
//   }
  
//   return result.trim() + ' Rupees Only';
// };

function ChitList({ chits, customers, onFilter, onDeleteChit }) {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chitToDelete, setChitToDelete] = useState(null);

  const handleDeleteClick = (chit) => {
    setChitToDelete(chit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chitToDelete) {
      onDeleteChit(chitToDelete.id);
      toast.success('Chit record deleted successfully!');
    }
    setDeleteDialogOpen(false);
    setChitToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setChitToDelete(null);
  };

  const handleCustomerChange = (event) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);
    onFilter(customerId);
  };

  // Function to get profit for a specific month
  // const getProfitForMonth = async (chitAmount, monthYear) => {
  //   try {
  //     const response = await fetch(`http://localhost:3001/api/profits?chitAmount=${chitAmount}`);
  //     const allProfits = await response.json();
      
  //     // Find profit for the specific month
  //     const monthProfit = allProfits.find(p => {
  //       const profitMonth = new Date(p.month).toLocaleString('default', { 
  //         month: 'long', 
  //         year: 'numeric' 
  //       });
  //       return profitMonth === monthYear;
  //     });
      
  //     return monthProfit ? parseFloat(monthProfit.amount) : 0;
  //   } catch (error) {
  //     console.error('Error fetching profit data:', error);
  //     return 0;
  //   }
  // };

  // Function to calculate profit and carry forward
  // const calculateProfitAndCarryForward = async (chitAmount, monthYear) => {
  //   try {
  //     // Fetch profit data for the specific month and chit amount
  //     const response = await fetch(`http://localhost:3001/api/profits?chitAmount=${chitAmount}`);
  //     const allProfits = await response.json();
      
  //     // Find profit for the specific month (monthYear is in format like "December 2024")
  //     const monthProfit = allProfits.find(p => {
  //       const profitMonth = new Date(p.month).toLocaleString('default', { 
  //         month: 'long', 
  //         year: 'numeric' 
  //       });
  //       return profitMonth === monthYear;
  //     });
      
  //     // Use actual profit from table or 0 if not found
  //     const profit = monthProfit ? parseFloat(monthProfit.amount) : 0;
      
  //     // Store current carry forward value (from previous month's result after -50,000)
  //     const previousCarryForward = window.currentCarryForward || 0;
      
  //     // Calculate new total including previous carry forward and current profit
  //     const newTotal = previousCarryForward + profit;
      
  //     // Calculate result after -50,000 deduction
  //     const resultAfterDeduction = newTotal - 50000;
      
  //     // Store this result for next month's carry forward
  //     window.currentCarryForward = Math.max(0, resultAfterDeduction);
      
  //     console.log('Carry forward calculation:', {
  //       monthYear,
  //       previousCarryForward,
  //       profit,
  //       newTotal,
  //       resultAfterDeduction,
  //       storedCarryForward: window.currentCarryForward
  //     });
      
  //     return {
  //       profit: profit.toFixed(2),
  //       carryForward: resultAfterDeduction.toFixed(2)
  //     };
  //   } catch (error) {
  //     console.error('Error fetching profit data:', error);
  //     // Fallback to 0 if there's an error
  //     return {
  //       profit: '0.00',
  //       carryForward: '0.00'
  //     };
  //   }
  // };

  // Function to fetch PAATA data
  // const fetchPaataData = async (chitAmount) => {
  //   try {
  //     console.log('Fetching PAATA data for chitAmount:', chitAmount); // Debug log
      
  //     const response = await fetch(`http://localhost:3001/api/paata?chitAmount=${chitAmount}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
      
  //     console.log('PAATA API response status:', response.status); // Debug log
      
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
      
  //     const data = await response.json();
  //     console.log('PAATA data received:', data); // Debug log
      
  //     // Ensure we have an array, even if empty
  //     if (!Array.isArray(data)) {
  //       console.warn('PAATA API did not return an array, using empty array');
  //       return [];
  //     }
      
  //     return data;
  //   } catch (error) {
  //     console.error('Error fetching paata data:', error);
  //     console.log('Server might not be running. Returning empty array'); // Debug log
      
  //     // Return empty array instead of fallback data
  //     return [];
  //   }
  // };

  const downloadPDF = async () => {
    console.log('PDF download started');
    try {
      if (!selectedCustomer) {
        alert('Please select a customer first');
        return;
      }

      const customer = customers.find(c => c.id.toString() === selectedCustomer.toString());
      if (!customer) {
        console.error('Customer not found');
        return;
      }

      console.log('Customer found:', customer);
      const customerChits = chits
        .filter(chit => chit.customerId.toString() === selectedCustomer.toString())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log('Customer chits:', customerChits);

      if (customerChits.length === 0) {
        alert('No records found for this customer');
        return;
      }
      
      // Fetch PAATA data with error handling
      let paataData = [];
      try {
        console.log('Starting PAATA data fetch for chitAmount:', customer.chitAmount);
        const paataResponse = await fetch(`http://localhost:3001/api/paata?chitAmount=${customer.chitAmount}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000 // 5 second timeout
        });
        
        if (paataResponse.ok) {
          paataData = await paataResponse.json();
          console.log('PAATA data fetched in PDF function:', paataData);
        } else {
          console.log('PAATA API not available, using empty array');
        }
      } catch (error) {
        console.log('PAATA API error, continuing without PAATA data:', error.message);
        // Continue without PAATA data
      }
      
      // Group chits by month
      const monthlyChits = customerChits.reduce((acc, chit) => {
        const monthYear = new Date(chit.date).toLocaleString('default', { 
          month: 'long', 
          year: 'numeric' 
        });
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(chit);
        return acc;
      }, {});

      // Initialize doc with Unicode support
      console.log('Creating PDF document...');
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        compress: false
      });
      
      // Load rupee-supporting font with robust error handling
      let rupeeFontName = 'helvetica'; // Default fallback
      try {
        console.log('Attempting to load custom rupee font...');
        const loaded = await loadRupeeFont(doc);
        if (typeof loaded === 'string' && loaded.trim().length > 0) {
          rupeeFontName = loaded;
          console.log('Using custom font:', rupeeFontName);
        } else if (loaded === true) {
          rupeeFontName = 'RupeeFont';
          console.log('Using RupeeFont');
        } else {
          console.log('Font loading returned false, using default');
        }
      } catch (err) {
        console.warn('Could not load embedded rupee font, using default:', err.message);
      }

      // Test and set font with fallback
      try {
        doc.setFont(rupeeFontName);
        doc.setFontSize(10);
        
        // Test if font works by getting text width
        const testWidth = doc.getTextWidth('Test');
        if (testWidth === 0) {
          console.log('Font test failed, switching to helvetica');
          rupeeFontName = 'helvetica';
          doc.setFont(rupeeFontName);
          doc.setFontSize(10);
        }
      } catch (fontError) {
        console.warn('Font setting failed, using helvetica:', fontError.message);
        rupeeFontName = 'helvetica';
        doc.setFont(rupeeFontName);
        doc.setFontSize(10);
      }

      // Test font support for rupee symbol
      let fontSupportsRupee = false;
      try {
        fontSupportsRupee = testRupeeSupport(doc, rupeeFontName);
        console.log('Font supports rupee symbol:', fontSupportsRupee);
      } catch (testError) {
        console.warn('Rupee support test failed:', testError.message);
        fontSupportsRupee = false;
      }
      
      // Helper to prefix rupee symbol for PDF amounts
      const addRupeeSymbol = (amount) => {
        const value = Number(amount || 0);
        const formatted = value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return fontSupportsRupee ? `Rs. ${formatted}` : `Rs. ${formatted}`;
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 15;
      let yPos = 20;

      // Process each month
      const monthEntries = Object.entries(monthlyChits);
      for (let mIndex = 0; mIndex < monthEntries.length; mIndex++) {
        const [monthYear, monthlyData] = monthEntries[mIndex];
        
        // Initialize carry forward only for the first month
        if (mIndex === 0) {
          window.currentCarryForward = 0;
        }
        
        // Add new page for each month after the first one
        if (mIndex > 0) {
          doc.addPage();
          yPos = 20;
        }

        // Get profit for this month with error handling
        let monthlyProfit = 0;
        try {
          const profitResponse = await fetch(`http://localhost:3001/api/profits?chitAmount=${customer.chitAmount}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000 // 5 second timeout
          });
          
          if (profitResponse.ok) {
            const allProfits = await profitResponse.json();
            const monthProfit = allProfits.find(p => {
              const profitMonth = new Date(p.month).toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
              });
              return profitMonth === monthYear;
            });
            monthlyProfit = monthProfit ? parseFloat(monthProfit.amount) : 0;
          } else {
            console.log('Profit API not available, using 0 profit');
          }
        } catch (error) {
          console.log('Profit API error, using 0 profit:', error.message);
          monthlyProfit = 0;
        }
        
        // Use 0 profit for first page, actual profit for subsequent pages
        const actualMonthlyProfit = mIndex === 0 ? 0 : monthlyProfit;

        // Add customer info with larger name (moved month to the right)
        try {
          doc.setFont(rupeeFontName, 'bold');
        } catch(e) { 
          console.warn('Bold font not supported, using normal');
          doc.setFont(rupeeFontName);
        }
        doc.setFontSize(16);
        doc.text(customer.name, leftMargin, yPos);
        
        // Add month year on the right side
        try {
          doc.setFont(rupeeFontName, 'bold');
        } catch(e) { 
          console.warn('Bold font not supported for month, using normal');
          doc.setFont(rupeeFontName);
        }
        doc.setFontSize(12);
        const monthYearText = monthYear;
        const monthYearWidth = doc.getTextWidth(monthYearText);
        doc.text(monthYearText, pageWidth - leftMargin - monthYearWidth, yPos);
        
        yPos += 10;

        // Add phone number below the name (already added customer name above)
        try {
          doc.setFont(rupeeFontName, 'normal');
        } catch(e) { 
          console.warn('Normal font not supported, using default');
          doc.setFont(rupeeFontName);
        }
        doc.setFontSize(10);
        doc.text(`Phone: ${customer.phone || 'N/A'}`, leftMargin, yPos);
        yPos += 10;

        // Add address if available
        if (customer.address) {
          doc.text(`Address: ${customer.address}`, leftMargin, yPos);
          yPos += 10;
        }

        // Add separation line
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
        yPos += 5;

        // Prepare table data with S.No for PDF
        const pdfTableData = monthlyData.map((chit, idx) => {
          const c = customers.find(cust => cust.id === chit.customerId);
          return {
            id: chit.id,
            sno: idx + 1,
            date: new Date(chit.date).toLocaleDateString(),
            customerName: c ? c.name : 'Unknown',
            amount: chit.amount,
            accountDetails: chit.accountDetails || 'N/A',
            type: chit.type
          };
        });

        // Format table rows for jspdf-autotable with automatic carry-forward and profit rows
        const pdfTableRows = [];
        
        // Get previous month's carry-forward (stored from previous month's result after -50,000)
        const prevCarryForward = window.currentCarryForward || 0;
        
        let currentSNo = 1;
        
        // Add carry-forward row if this is not the first month
        if (prevCarryForward > 0) {
          pdfTableRows.push([
            { content: currentSNo.toString(), styles: { halign: 'center', fontStyle: 'bold' }},
            { content: '-', styles: { halign: 'center' }},
            { content: "Last Month's Forwarded Amount", styles: { halign: 'center', fontStyle: 'bold' }},
            {
              content: addRupeeSymbol(prevCarryForward),
              styles: { 
                halign: 'right',
                fontStyle: 'bold'
              }
            }
          ]);
          currentSNo++;
        }
        
        // Add profit row from profits table
        if (monthlyProfit > 0 && mIndex > 0) {
          pdfTableRows.push([
            { content: currentSNo.toString(), styles: { halign: 'center', fontStyle: 'bold' }},
            { content: '-', styles: { halign: 'center' }},
            { content: "Month's profit", styles: { halign: 'center', fontStyle: 'bold' }},
            {
              content: addRupeeSymbol(monthlyProfit),
              styles: { 
                halign: 'right',
                fontStyle: 'bold'
              }
            }
          ]);
          currentSNo++;
        }
        
        // Add user chit entries (start S.No from currentSNo)
        pdfTableData.forEach((chit) => {
          pdfTableRows.push([
            { content: currentSNo.toString(), styles: { halign: 'center' }},
            { content: chit.date, styles: { halign: 'center' }},
            { content: chit.accountDetails, styles: { halign: 'center' }},
            {
              content: addRupeeSymbol(chit.amount),
              styles: { 
                halign: 'right',
                fontStyle: 'normal'
              }
            }
          ]);
          currentSNo++;
        });

        // Calculate total for the month - sum all amounts as positive values
        const monthlyTotalFromChits = monthlyData.reduce((sum, chit) => {
          return sum + parseFloat(chit.amount || 0); // Add all amounts as positive
        }, 0);

        // Total calculation: previous carry forward + current month profit + current month chits
        // All values should be positive and additive
        const totalWithCarryForward = monthlyTotalFromChits + (prevCarryForward || 0) + (actualMonthlyProfit || 0);

        // Add total row after all entries including carry forward and profit
        const totalAmount = totalWithCarryForward;

        // Subtract 50,000 from total and pass to next month
        const deductionAmount = 50000;
        const afterSubtraction = totalAmount - deductionAmount;
        
        // Store the result after -50,000 for next month's carry forward
        window.currentCarryForward = afterSubtraction;
        
        console.log('Complete calculation breakdown:', {
          monthYear,
          prevCarryForward,
          monthlyProfit,
          monthlyTotalFromChits,
          totalWithCarryForward,
          totalAmount,
          deductionAmount,
          afterSubtraction,
          nextMonthCarryForward: window.currentCarryForward,
          chitEntries: monthlyData.length
        });
        
        pdfTableRows.push([
          { content: '', styles: { halign: 'center' } },
          { content: '', styles: { halign: 'center' } },
          { content: '', styles: { halign: 'center' } },
          { content: `Total = ${addRupeeSymbol(totalAmount)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 9 } }
        ]);
        
        pdfTableRows.push([
          { content: '', colSpan: 3, styles: { halign: 'center', fillColor: [255, 255, 255], lineWidth: 0 } },
          { content: `= - ${addRupeeSymbol(50000)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 9 } }
        ]);
        
        pdfTableRows.push([
          { content: '', colSpan: 3, styles: { halign: 'center', fillColor: [255, 255, 255], lineWidth: 0 } },
          { content: `= ${addRupeeSymbol(afterSubtraction)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 9 } }
        ]);

        // Add table to PDF with full width
        const tableWidth = pageWidth - (leftMargin * 2);
        const columnWidths = [
          tableWidth * 0.08,  // S.No (8%)
          tableWidth * 0.18, // Date (18%)
          tableWidth * 0.44, // Account Details (44%)
          tableWidth * 0.30   // Amount (30% - Increased width)
        ];

        doc.autoTable({
          head: [['S.No', 'Date', 'Account Details', 'Amount']],
          body: pdfTableRows,
          startY: yPos,
          theme: 'grid',
          tableWidth: 'wrap',
          margin: { left: leftMargin, right: leftMargin },
          headStyles: {
            fillColor: [135, 206, 235], // Skyblue color (same as PAATA table)
            textColor: 0, // Black text for contrast
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
            halign: 'center',
            valign: 'middle',
            lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 }, // Only horizontal lines
            lineColor: [0, 0, 0]
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: { top: 1, right: 2, bottom: 1, left: 2 },
            halign: 'center',
            valign: 'middle',
            lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 }, // Only horizontal lines
            lineColor: [0, 0, 0]
          },
          columnStyles: {
            0: { 
              cellWidth: columnWidths[0], 
              halign: 'center',
              cellPadding: { top: 1, right: 2, bottom: 1, left: 2 }
            },  // S.No
            1: { 
              cellWidth: columnWidths[1],
              cellPadding: { top: 1, right: 2, bottom: 1, left: 2 }
            },  // Date
            2: { 
              cellWidth: columnWidths[2],
              cellPadding: { top: 1, right: 2, bottom: 1, left: 2 }
            },  // Account Details
            3: { 
              cellWidth: columnWidths[3], 
              halign: 'right',
              cellPadding: { top: 1, right: 10, bottom: 1, left: 2 },
              headStyles: { halign: 'right' }
            },    // Amount
          },
          styles: {
            cellPadding: 0,
            lineColor: [0, 0, 0],
            lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 }, // Only horizontal lines
            minCellHeight: 8,
            fontSize: 8,
            font: rupeeFontName
          },
          didDrawPage: (data) => {
            // Add page number with proper page counting
            try {
              const pageSize = doc.internal.pageSize;
              const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
              doc.setFontSize(8);
              
              // Get the current page number from the document
              const currentPage = doc.internal.getNumberOfPages();
              
              try {
                doc.setFont(rupeeFontName);
              } catch (e) {
                console.warn('Font setting failed for page number, using default');
                doc.setFont('helvetica');
              }
              doc.text(
                `Page ${currentPage}`,
                data.settings.margin.left,
                pageHeight - 10
              );
            } catch (pageError) {
              console.warn('Error drawing page number:', pageError.message);
            }
          }
        });
        
        // Add Paata table at the bottom with error handling
        try {
          console.log('Fetching PAATA data for chitAmount:', customer.chitAmount);
          const paataResponse = await fetch(`http://localhost:3001/api/paata?chitAmount=${customer.chitAmount}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000 // 5 second timeout
          });
          
          if (paataResponse.ok) {
            const paataData2 = await paataResponse.json();
            console.log('PAATA data received:', paataData2);
            
            // Filter paata data for the current month
            const currentMonthPaata = paataData2.filter(item => {
              const itemMonth = new Date(item.month).toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
              });
              return itemMonth === monthYear;
            });
            
            console.log('Current month PAATA data:', currentMonthPaata);
            
            if (currentMonthPaata.length > 0) {
              // Create small paata table
              const paataTableRows = currentMonthPaata.map(item => [
                { content: new Date(item.month).toLocaleDateString('en-IN', { month: 'short' }), styles: { halign: 'center', fontStyle: 'bold' } },
                { content: addRupeeSymbol(item.amount), styles: { halign: 'center', fontStyle: 'bold' } } // Changed from center to right and added rupee symbol
              ]);
              
              // Get the final Y position of the main table and add some padding
              const mainTableFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos + 100;
              const paataStartY = Math.min(mainTableFinalY + 15, 250); // Reverted to original padding
              
              doc.autoTable({
                head: [['PAATA', 'Amount']],
                body: paataTableRows,
                startY: paataStartY, // Dynamic positioning
                theme: 'grid',
                tableWidth: 80, // Small table width
                margin: { left: leftMargin },
                headStyles: {
                  fillColor: [135, 206, 235], // Skyblue color
                  textColor: 0,
                  fontStyle: 'bold',
                  fontSize: 8,
                  cellPadding: 2,
                  halign: 'center',
                  lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 }
                },
                bodyStyles: {
                  fontSize: 8,
                  cellPadding: 2,
                  halign: 'center',
                  lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 }
                },
                columnStyles: {
                  0: { cellWidth: 30, halign: 'center' }, // PAATA column
                  1: { cellWidth: 50, halign: 'right' }  // Amount column - Changed from center to right
                },
                styles: {
                  lineColor: [0, 0, 0],
                  fontSize: 8,
                  font: rupeeFontName
                }
              });
            }
          } else {
            console.log('PAATA API not available for table, skipping PAATA table');
          }
        } catch (error) {
          console.error('Error fetching PAATA data for table:', error);
          // Continue without PAATA table
        }
      }
      
      // Save the PDF with error handling
      try {
        const fileName = `${customer.name.replace(/[^a-z0-9]/gi, '_')}_chit_statement.pdf`;
        console.log('Saving PDF as:', fileName);
        
        // Method 1: Try direct save first
        try {
          doc.save(fileName);
          console.log('PDF saved via direct save method');
        } catch (directSaveError) {
          console.warn('Direct save failed, trying blob method:', directSaveError.message);
          
          // Method 2: Create blob and trigger download
          try {
            const pdfBlob = doc.output('blob');
            const downloadUrl = URL.createObjectURL(pdfBlob);
            
            // Create temporary link element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up URL
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
            
            console.log('PDF saved via blob method');
          } catch (blobError) {
            console.warn('Blob method failed, trying data URL:', blobError.message);
            
            // Method 3: Data URL method
            try {
              const dataUrl = doc.output('dataurlstring');
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = fileName;
              link.style.display = 'none';
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              console.log('PDF saved via data URL method');
            } catch (dataUrlError) {
              console.error('All download methods failed:', dataUrlError.message);
              throw new Error('Unable to download PDF. Please check your browser settings.');
            }
          }
        }
        
        console.log('PDF generation completed');
        
        // Show success message with file name
        alert(`PDF generated successfully! File: ${fileName}`);
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        throw new Error('Failed to save PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error generating PDF: ${errorMessage}. Please try again.`);
    }
  };


  // Format currency for display
  const formatCurrency = (num) => {
    const absNum = Math.abs(num);
    const formatted = absNum.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return num < 0 ? `Rs.${formatted}` : `Rs.${formatted}`;
  };

  // Prepare table data with S.No for the main component
  const tableData = chits
    .filter(chit => !selectedCustomer || chit.customerId.toString() === selectedCustomer.toString())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((chit, index) => {
      const customer = customers.find(c => c.id === chit.customerId);
      return {
        id: chit.id,
        sno: index + 1,
        date: new Date(chit.date).toLocaleDateString('en-IN'),
        customerName: customer ? customer.name : 'Unknown',
        amount: chit.amount,
        accountDetails: chit.accountDetails || '-',
        transactionType: chit.transactionType
      };
    });

  if (chits.length === 0) {
    return <Typography>No chit records found. Add your first chit record to get started.</Typography>;
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="customer-filter-label">Select Customer</InputLabel>
          <Select
            labelId="customer-filter-label"
            id="customer-filter"
            value={selectedCustomer}
            label="Select Customer"
            onChange={handleCustomerChange}
          >
            <MenuItem value="">All Customers</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={downloadPDF}
          disabled={!selectedCustomer}
        >
          Download as PDF
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="chit records table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '10%' }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>Account Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '20%' }}>Amount (₹)</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ textAlign: 'center' }}>{row.sno}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.accountDetails}</TableCell>
                  <TableCell sx={{ textAlign: 'right', color: row.transactionType === 'debit' ? 'red' : 'inherit' }}>
                    {row.transactionType === 'debit' ? '' : '-'}₹{Math.abs(parseFloat(row.amount)).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton 
                      aria-label="delete" 
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(row);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {chits.length > 0 && (
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total Balance (₹):</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {(() => {
                    const total = chits
                      .filter(chit => !selectedCustomer || chit.customerId === selectedCustomer)
                      .reduce((sum, chit) => {
                        const amount = parseFloat(chit.amount);
                        return chit.transactionType === 'debit' ? sum + amount : sum - amount;
                      }, 0);
                    return formatCurrency(total);
                  })()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this chit record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ChitList;