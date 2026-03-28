/**
 * ERP Constructora Chile — InsForge Backend Setup v2
 * Ejecutar: node erp_insforge_setup.js
 * API: POST /api/database/tables  (InsForge native API)
 */

const BASE_URL = process.env.INSFORGE_BASE_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;
if (!BASE_URL || !API_KEY) {
  console.error('Defina INSFORGE_BASE_URL e INSFORGE_API_KEY en el entorno (copie .env.example a .env y no suba .env a Git).');
  process.exit(1);
}
const HEADERS  = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` };

// ── Helpers ───────────────────────────────────────────────────
async function createTable(tableName, columns) {
  const res  = await fetch(`${BASE_URL}/api/database/tables`, {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({ tableName, columns, rlsEnabled: false }),
  });
  const body = await res.text();
  if (res.ok || body.includes('already exist') || body.includes('duplicate')) {
    console.log(`  ✅ ${tableName}`); return true;
  }
  console.error(`  ❌ ${tableName}: ${res.status} — ${body.slice(0,100)}`); return false;
}

async function insertRecords(tableName, records) {
  const arr = Array.isArray(records) ? records : [records];
  const res  = await fetch(`${BASE_URL}/api/database/records/${tableName}`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(arr),
  });
  if (res.ok) { console.log(`  ✅ ${arr.length} fila(s) → ${tableName}`); return true; }
  const t = await res.text();
  console.warn(`  ⚠️  ${tableName}: ${res.status} — ${t.slice(0,100)}`); return false;
}

// ── Column builders ───────────────────────────────────────────
const c  = (name, type, opts={}) => ({ name, type, nullable:true, ...opts });
const pk = () => c('id','uuid',{nullable:false,defaultValue:'gen_random_uuid()'});
const ts = (name='created_at') => c(name,'timestamp',{defaultValue:'now()'});
const fk = (name,table,col='id',onDelete='CASCADE') =>
  c(name,'uuid',{foreignKey:{table,column:col,onDelete}});

// ════════════════════════════════════════════════════════════════
// TABLES
// ════════════════════════════════════════════════════════════════
const TABLES = [
  { tableName:'company', columns:[
    pk(), c('rut','string',{nullable:false}), c('name','string',{nullable:false}),
    c('giro','string'), c('address','string'), c('email','string'), c('phone','string'),
    c('sii_env','string',{defaultValue:'certificacion'}), c('sii_api_key','string'),
    c('logo_url','text'), ts(), ts('updated_at'),
  ]},
  { tableName:'users', columns:[
    pk(), c('name','string',{nullable:false}), c('email','string',{nullable:false,unique:true}),
    c('pass_hash','string'), c('role','string',{nullable:false,defaultValue:'JEFE'}),
    c('phone','string'), c('avatar_url','text'), c('active','boolean',{defaultValue:'true'}),
    c('last_login','timestamp'), ts(), ts('updated_at'),
  ]},
  { tableName:'projects', columns:[
    pk(), c('code','string',{nullable:false,unique:true}), c('name','string',{nullable:false}),
    c('client','string'), c('client_rut','string'), c('address','string'), c('type','string'),
    c('status','string',{nullable:false,defaultValue:'COTIZACION'}),
    c('start_date','date'), c('end_date','date'),
    c('contract_amt','integer',{defaultValue:'0'}), c('progress','integer',{defaultValue:'0'}),
    ts(), ts('updated_at'),
  ]},
  { tableName:'project_users', columns:[
    fk('project_id','projects'), fk('user_id','users'), ts(),
  ]},
  { tableName:'budget_apu', columns:[
    pk(), fk('project_id','projects'), c('chapter','string',{nullable:false}),
    c('code','string'), c('description','text',{nullable:false}), c('unit','string'),
    c('quantity','decimal',{defaultValue:'0'}),
    c('up_mo','integer',{defaultValue:'0'}), c('up_mat','integer',{defaultValue:'0'}),
    c('up_sc','integer',{defaultValue:'0'}), c('up_eq','integer',{defaultValue:'0'}),
    c('markup_pct','decimal',{defaultValue:'30'}), c('progress','integer',{defaultValue:'0'}),
    c('active','boolean',{defaultValue:'true'}), ts(), ts('updated_at'),
  ]},
  { tableName:'general_expenses', columns:[
    pk(), fk('project_id','projects'), c('description','string',{nullable:false}),
    c('amount','integer',{nullable:false}), c('category','string',{nullable:false}),
    c('period','string'), c('recurrent','boolean',{defaultValue:'false'}),
    c('paid','boolean',{defaultValue:'false'}), ts(),
  ]},
  { tableName:'cash_flow', columns:[
    pk(), fk('project_id','projects'),
    c('year','integer',{nullable:false}), c('month','integer',{nullable:false}),
    c('inc_plan','integer',{defaultValue:'0'}), c('inc_real','integer',{defaultValue:'0'}),
    c('exp_plan','integer',{defaultValue:'0'}), c('exp_real','integer',{defaultValue:'0'}), ts(),
  ]},
  { tableName:'suppliers', columns:[
    pk(), c('rut','string',{nullable:false,unique:true}), c('name','string',{nullable:false}),
    c('contact','string'), c('phone','string'), c('email','string'), c('address','string'),
    c('payment_days','integer',{defaultValue:'30'}), c('active','boolean',{defaultValue:'true'}), ts(),
  ]},
  { tableName:'subcontractors', columns:[
    pk(), c('company','string',{nullable:false}), c('rut_company','string'),
    c('name_contact','string',{nullable:false}), c('rut_contact','string',{nullable:false}),
    c('email','string'), c('phone','string'), c('address','string'),
    c('web','string'), c('specialty','string'),
    c('rating','integer',{defaultValue:'4'}), c('active','boolean',{defaultValue:'true'}), ts(),
  ]},
  { tableName:'subcontracts', columns:[
    pk(), fk('project_id','projects'), fk('supplier_id','suppliers','id','SET NULL'),
    fk('subcontractor_id','subcontractors','id','SET NULL'),
    c('chapter','string'), c('description','text',{nullable:false}),
    c('amount','integer',{nullable:false}), c('retention_pct','decimal',{defaultValue:'5'}),
    c('progress','integer',{defaultValue:'0'}), c('status','string',{defaultValue:'ACTIVO'}),
    c('start_date','date'), c('end_date','date'), ts(),
  ]},
  { tableName:'payment_states', columns:[
    pk(), fk('subcontract_id','subcontracts'), c('code','string',{nullable:false}),
    c('amount','integer',{nullable:false}), c('date','date'),
    c('paid','boolean',{defaultValue:'false'}), c('paid_date','date'), ts(),
  ]},
  { tableName:'materials', columns:[
    pk(), c('code','string',{nullable:false,unique:true}), c('name','string',{nullable:false}),
    c('unit','string'), c('category','string'),
    c('ref_price','integer',{defaultValue:'0'}), c('min_stock','decimal',{defaultValue:'0'}), ts(),
  ]},
  { tableName:'stock_movements', columns:[
    pk(), fk('material_id','materials','id','SET NULL'), fk('project_id','projects','id','SET NULL'),
    fk('user_id','users','id','SET NULL'), c('type','string',{nullable:false}),
    c('quantity','decimal',{nullable:false}), c('unit_price','integer',{defaultValue:'0'}),
    c('notes','text'), c('date','date'), ts(),
  ]},
  { tableName:'purchases', columns:[
    pk(), c('code','string',{nullable:false,unique:true}),
    fk('project_id','projects','id','SET NULL'), fk('supplier_id','suppliers','id','SET NULL'),
    c('status','string',{defaultValue:'PENDIENTE'}), c('total','integer',{defaultValue:'0'}),
    c('notes','text'), fk('requested_by','users','id','SET NULL'),
    fk('approved_by','users','id','SET NULL'),
    c('request_date','date'), c('approve_date','date'), c('receive_date','date'), ts(),
  ]},
  { tableName:'purchase_items', columns:[
    pk(), fk('purchase_id','purchases'), fk('material_id','materials','id','SET NULL'),
    c('quantity','decimal',{nullable:false}), c('unit_price','integer',{nullable:false}),
    c('total','integer',{defaultValue:'0'}), ts(),
  ]},
  { tableName:'workers', columns:[
    pk(), c('rut','string',{nullable:false,unique:true}), c('name','string',{nullable:false}),
    c('role','string'), fk('project_id','projects','id','SET NULL'),
    c('contract_type','string',{defaultValue:'OBRA'}), c('gross_salary','integer',{nullable:false}),
    c('afp','string'), c('health_plan','string'), c('health_pct','decimal',{defaultValue:'7.0'}),
    c('start_date','date'), c('active','boolean',{defaultValue:'true'}), ts(), ts('updated_at'),
  ]},
  { tableName:'attendance', columns:[
    pk(), fk('worker_id','workers','id','SET NULL'), fk('project_id','projects','id','SET NULL'),
    c('date','date',{nullable:false}), c('hours','decimal',{defaultValue:'8'}),
    c('extra_hours','decimal',{defaultValue:'0'}), c('task','text'), ts(),
  ]},
  { tableName:'invoices', columns:[
    pk(), c('code','string',{nullable:false,unique:true}), c('dte_type','integer',{defaultValue:'33'}),
    fk('project_id','projects','id','SET NULL'), c('recip_rut','string',{nullable:false}),
    c('recip_name','string',{nullable:false}), c('net_amount','integer',{nullable:false}),
    c('iva','integer',{nullable:false}), c('total','integer',{nullable:false}),
    c('status','string',{defaultValue:'PENDIENTE'}), c('folio','string'),
    c('track_id','string'), c('issue_date','date'), ts(),
  ]},
  { tableName:'bank_accounts', columns:[
    pk(), c('name','string',{nullable:false}), c('bank','string'), c('account_num','string'),
    c('currency','string',{defaultValue:'CLP'}), c('balance','integer',{defaultValue:'0'}), ts(),
  ]},
  { tableName:'bank_transactions', columns:[
    pk(), fk('account_id','bank_accounts'), c('date','date',{nullable:false}),
    c('description','string',{nullable:false}), c('amount','integer',{nullable:false}),
    c('type','string',{nullable:false}), c('reference','string'),
    c('matched_doc','string'), ts(),
  ]},
];

// ════════════════════════════════════════════════════════════════
// SEED
// ════════════════════════════════════════════════════════════════
async function seed() {
  console.log('\n📦 Insertando datos iniciales...');

  await insertRecords('company',{rut:'76123456-7',name:'Constructora Vega & Torres Ltda.',
    giro:'Construcción y edificación',address:'Av. Providencia 1234, Santiago',
    email:'contacto@constructora.cl',phone:'+5622345678'});

  await insertRecords('users',[
    {name:'Carlos Vega',   email:'admin@obra.cl',role:'ADMIN',phone:'+56912345678',active:true},
    {name:'Pedro Fuentes', email:'jefe@obra.cl', role:'JEFE', phone:'+56987654321',active:true},
    {name:'Ana Torres',    email:'ana@obra.cl',  role:'ADMIN',phone:'+56911223344',active:true},
    {name:'Luis Morales',  email:'luis@obra.cl', role:'JEFE', phone:'+56955667788',active:true},
    {name:'María Castillo',email:'maria@obra.cl',role:'JEFE', phone:'+56944556677',active:false},
  ]);

  await insertRecords('projects',[
    {code:'OBR-001',name:'Edificio Residencial Los Álamos',   client:'Inmobiliaria Sur Ltda.',    client_rut:'76543210-1',address:'Av. Las Condes 1234',     type:'VIVIENDA',    status:'EJECUCION', start_date:'2024-03-01',end_date:'2025-06-30',contract_amt:850000000,progress:45},
    {code:'OBR-002',name:'Bodega Industrial Quilicura',        client:'Logística Total S.A.',      client_rut:'77123456-2',address:'Ruta 5 Norte Km 23',       type:'INDUSTRIAL',  status:'EJECUCION', start_date:'2024-06-01',end_date:'2025-03-31',contract_amt:320000000,progress:62},
    {code:'OBR-003',name:'Remodelación Oficinas Torre Central',client:'Holding Andino S.A.',       client_rut:'78456789-3',address:'Av. Apoquindo 4500',        type:'REMODELACION',status:'COTIZACION',start_date:'2025-01-15',end_date:'2025-05-31',contract_amt:95000000, progress:0},
    {code:'OBR-004',name:'Pavimentación Sector Norte',         client:'Municipalidad de Pudahuel', client_rut:'69998887-6',address:'Calle Los Copihues s/n',    type:'VIAL',        status:'ADJUDICADO',start_date:'2025-02-01',end_date:'2025-08-31',contract_amt:180000000,progress:5},
  ]);

  await insertRecords('suppliers',[
    {rut:'12345678-9',name:'Hormigones del Pacífico S.A.',contact:'Juan Pérez',  phone:'+5622111111',email:'ventas@hormipac.cl',   payment_days:30},
    {rut:'23456789-0',name:'Aceros Andes Ltda.',          contact:'Rosa Muñoz',  phone:'+5622222222',email:'compras@acerosandes.cl',payment_days:0},
    {rut:'34567890-1',name:'Ferretería Industrial Norte', contact:'Mario López', phone:'+5622333333',email:'mario@ferretnorte.cl',  payment_days:15},
    {rut:'45678901-2',name:'Eléctrica Sur Ltda.',         contact:'Claudia Vidal',phone:'+5622444444',email:'cv@electsur.cl',       payment_days:60},
  ]);

  await insertRecords('materials',[
    {code:'HG-H30',  name:'Hormigón H-30',      unit:'m³',  category:'HORMIGON',    ref_price:145000,min_stock:20},
    {code:'AC-A6342',name:'Enfierrado A63-42H', unit:'kg',  category:'ACERO',       ref_price:1250,  min_stock:500},
    {code:'LA-STD',  name:'Ladrillo 14x7x28',   unit:'un',  category:'MAMPOSTERIA', ref_price:320,   min_stock:2000},
    {code:'CEM-CPR', name:'Cemento CPR 42.5',   unit:'saco',category:'AGLOMERANTES',ref_price:8500,  min_stock:50},
    {code:'AR-FIN',  name:'Arena fina',          unit:'m³',  category:'ARIDOS',      ref_price:28000, min_stock:10},
  ]);

  await insertRecords('bank_accounts',[
    {name:'Cuenta Corriente Operacional',bank:'Banco de Chile',account_num:'00-123-45678-90',currency:'CLP',balance:45320000},
    {name:'Cuenta Corriente Proveedores',bank:'Santander',     account_num:'0312-789456-00', currency:'CLP',balance:12800000},
    {name:'Cuenta Corriente USD',        bank:'BCI',           account_num:'65-00123456',    currency:'USD',balance:18500},
  ]);

  await insertRecords('subcontractors',[
    {company:'Eléctricas del Pacífico SpA', rut_company:'76887654-2',name_contact:'Rodrigo Muñoz',    rut_contact:'12987654-3',specialty:'Instalaciones Eléctricas MT/BT',email:'rodrigo@electpac.cl',  phone:'+56987112233',rating:5},
    {company:'Climatización Andes Ltda.',   rut_company:'77654321-0',name_contact:'Patricia Espinoza',rut_contact:'14321098-7',specialty:'HVAC y Climatización',          email:'patricia@climandes.cl',phone:'+56965443322',rating:4},
    {company:'Pintura & Terminaciones JR',  rut_company:'',          name_contact:'Juan Carlos Rojas', rut_contact:'9876543-2', specialty:'Pintura y Terminaciones',       email:'jcrojas@gmail.com',    phone:'+56944332211',rating:4},
    {company:'Pavimentos Sur S.A.',         rut_company:'76123789-5',name_contact:'Sandra López',      rut_contact:'16543210-8',specialty:'Pavimentación y Vialidad',      email:'slopez@pavsur.cl',     phone:'+56933221100',rating:5},
  ]);
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main(){
  console.log('🚀 ERP Constructora — InsForge Setup v2');
  console.log(`📡 ${BASE_URL}`);
  console.log('─'.repeat(50));

  // Connection test
  console.log('\n🔌 Probando conexión...');
  const test = await fetch(`${BASE_URL}/api/database/tables`, {headers:HEADERS});
  console.log(`  → ${test.status} ${test.statusText}`);
  if (test.status >= 500) { console.error('❌ Error de servidor'); process.exit(1); }
  console.log('  ✅ Conectado\n');

  // Create tables
  console.log(`🏗️  Creando ${TABLES.length} tablas...`);
  let ok=0, fail=0;
  for (const t of TABLES) { (await createTable(t.tableName, t.columns)) ? ok++ : fail++; }
  console.log(`\n📊 Resultado: ${ok} ok, ${fail} fallidas`);

  // Seed
  await seed();

  console.log('\n'+'═'.repeat(50));
  console.log('✅  BACKEND ERP LISTO EN INSFORGE');
  console.log(`🔗  ${BASE_URL}`);
  console.log('    20 tablas · datos iniciales insertados');
  console.log('='+'═'.repeat(49));
}

main().catch(e=>{ console.error('\n❌',e.message); process.exit(1); });
