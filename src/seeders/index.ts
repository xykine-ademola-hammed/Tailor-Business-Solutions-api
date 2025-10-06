import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { User, Customer, Product, Order, OrderItem, Measurement, Invoice, UserRole, ProductCategory, OrderStatus, InvoiceStatus } from '../models';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    await connectDatabase();

    console.log('Clearing existing data...');
    await Invoice.destroy({ where: {}, truncate: true, cascade: true });
    await OrderItem.destroy({ where: {}, truncate: true, cascade: true });
    await Order.destroy({ where: {}, truncate: true, cascade: true });
    await Measurement.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await Customer.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tailor.com',
      password: 'password123',
      role: UserRole.ADMIN
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@tailor.com',
      password: 'password123',
      role: UserRole.MANAGER
    });

    console.log('Creating customers...');
    const customers = await Customer.bulkCreate([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        totalSpent: 0,
        orderCount: 0
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        totalSpent: 0,
        orderCount: 0
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1234567892',
        address: '789 Pine Rd',
        city: 'Chicago',
        totalSpent: 0,
        orderCount: 0
      },
      {
        name: 'Alice Williams',
        email: 'alice.williams@example.com',
        phone: '+1234567893',
        address: '321 Elm St',
        city: 'Houston',
        totalSpent: 0,
        orderCount: 0
      }
    ]);

    console.log('Creating products...');
    const products = await Product.bulkCreate([
      {
        name: 'Custom Suit',
        category: ProductCategory.SUIT,
        description: 'Premium custom-tailored suit',
        basePrice: 899.99,
        materialCost: 300,
        laborCost: 200
      },
      {
        name: 'Dress Shirt',
        category: ProductCategory.SHIRT,
        description: 'Custom fitted dress shirt',
        basePrice: 149.99,
        materialCost: 40,
        laborCost: 30
      },
      {
        name: 'Formal Pants',
        category: ProductCategory.PANT,
        description: 'Custom tailored formal pants',
        basePrice: 199.99,
        materialCost: 60,
        laborCost: 40
      },
      {
        name: 'Designer Kurta',
        category: ProductCategory.KURTA,
        description: 'Traditional designer kurta',
        basePrice: 249.99,
        materialCost: 80,
        laborCost: 50
      },
      {
        name: 'Wedding Sherwani',
        category: ProductCategory.SHERWANI,
        description: 'Luxury wedding sherwani',
        basePrice: 1299.99,
        materialCost: 500,
        laborCost: 300
      }
    ]);

    console.log('Creating measurements...');
    await Measurement.bulkCreate([
      {
        customerId: customers[0].id,
        garmentType: ProductCategory.SUIT,
        measurements: {
          chest: 40,
          waist: 34,
          shoulders: 18,
          sleeveLength: 25,
          jacketLength: 30,
          pantWaist: 34,
          pantLength: 42
        },
        notes: 'Prefers slim fit'
      },
      {
        customerId: customers[1].id,
        garmentType: ProductCategory.SHIRT,
        measurements: {
          chest: 36,
          waist: 30,
          shoulders: 16,
          sleeveLength: 24,
          shirtLength: 28
        },
        notes: 'Regular fit preferred'
      }
    ]);

    console.log('Creating orders...');
    const order1 = await Order.create({
      orderNumber: 'ORD-1001',
      customerId: customers[0].id,
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      totalAmount: 1099.98,
      advancePayment: 500,
      remainingPayment: 599.98,
      status: OrderStatus.IN_PROGRESS,
      notes: 'Rush order - wedding event'
    });

    await OrderItem.bulkCreate([
      {
        orderId: order1.id,
        productId: products[0].id,
        productName: products[0].name,
        quantity: 1,
        unitPrice: 899.99,
        totalPrice: 899.99,
        specifications: 'Navy blue, slim fit'
      },
      {
        orderId: order1.id,
        productId: products[1].id,
        productName: products[1].name,
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99,
        specifications: 'White, French cuff'
      }
    ]);

    const order2 = await Order.create({
      orderNumber: 'ORD-1002',
      customerId: customers[1].id,
      orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: 449.98,
      advancePayment: 200,
      remainingPayment: 249.98,
      status: OrderStatus.COMPLETED,
      notes: 'Standard delivery'
    });

    await OrderItem.bulkCreate([
      {
        orderId: order2.id,
        productId: products[3].id,
        productName: products[3].name,
        quantity: 1,
        unitPrice: 249.99,
        totalPrice: 249.99,
        specifications: 'Red with gold embroidery'
      },
      {
        orderId: order2.id,
        productId: products[2].id,
        productName: products[2].name,
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
        specifications: 'Black, regular fit'
      }
    ]);

    console.log('Updating customer stats...');
    await customers[0].update({
      totalSpent: 1099.98,
      orderCount: 1
    });

    await customers[1].update({
      totalSpent: 449.98,
      orderCount: 1
    });

    console.log('Creating invoices...');
    await Invoice.create({
      invoiceNumber: 'INV-1001',
      orderId: order1.id,
      customerId: customers[0].id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 1099.98,
      tax: 87.99,
      discount: 0,
      total: 1187.97,
      status: InvoiceStatus.SENT,
      notes: 'Payment due within 30 days'
    });

    await Invoice.create({
      invoiceNumber: 'INV-1002',
      orderId: order2.id,
      customerId: customers[1].id,
      invoiceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      subtotal: 449.98,
      tax: 35.99,
      discount: 50,
      total: 435.97,
      status: InvoiceStatus.PAID,
      notes: 'Paid in full'
    });

    console.log('✓ Database seeding completed successfully!');
    console.log(`
Summary:
- Users created: 2
- Customers created: 4
- Products created: 5
- Measurements created: 2
- Orders created: 2
- Order items created: 4
- Invoices created: 2

Test Credentials:
Admin: admin@tailor.com / password123
Manager: manager@tailor.com / password123
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
