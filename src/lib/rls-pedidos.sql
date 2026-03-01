-- RLS para que clientes vean sus pedidos
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins y empleados ven todos los pedidos" ON orders FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'empleado'))
);

CREATE POLICY "Clientes ven sus pedidos" ON orders FOR SELECT
USING (
  customer_id IN (SELECT id FROM customers WHERE email = auth.jwt()->>'email')
);

CREATE POLICY "Admins gestionan pedidos" ON orders FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins y empleados ven items" ON order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'empleado'))
);

CREATE POLICY "Clientes ven sus items" ON order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders WHERE customer_id IN (
      SELECT id FROM customers WHERE email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Admins gestionan items" ON order_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins y empleados ven pagos" ON payments FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'empleado'))
);

CREATE POLICY "Clientes ven sus pagos" ON payments FOR SELECT
USING (
  customer_id IN (SELECT id FROM customers WHERE email = auth.jwt()->>'email')
);

CREATE POLICY "Admins gestionan pagos" ON payments FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
