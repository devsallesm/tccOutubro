const STORAGE_KEY = 'avance_bicicletarias_v1';
const lista = document.querySelector('#lista');
const busca = document.querySelector('#busca');
const form = document.querySelector('#formLoja');
const produtosForm = document.querySelector('#produtosForm');
const dialog = document.querySelector('#catalogoDialog');
let lojas = [];
try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); lojas = Array.isArray(saved) ? saved : []; } catch { lojas = []; }
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(lojas));
function element(tag, className, content) { const el = document.createElement(tag); if(className) el.className=className; if(content !== undefined) el.textContent=content; return el; }
function addProduto() {
  const row = element('div','product-row');
  const fields = [['Nome da peça *','nome','text'],['Preço (R$)','preco','number'],['Descrição','descricao','text']];
  fields.forEach(([title,name,type]) => { const label=element('label','',title); const input=element('input'); input.name=name; input.type=type; input.required=name==='nome'; input.maxLength= name==='descricao'?200:100; if(type==='number'){input.min='0';input.step='0.01';} label.append(input); row.append(label); });
  const remove=element('button','remove-product','Remover'); remove.type='button'; remove.addEventListener('click',()=>row.remove()); row.append(remove); produtosForm.append(row);
}
document.querySelector('#addProduto').addEventListener('click',addProduto);
function render() {
  lista.replaceChildren(); const term=busca.value.trim().toLocaleLowerCase('pt-BR');
  const matches=lojas.filter(l=>`${l.nome} ${l.endereco}`.toLocaleLowerCase('pt-BR').includes(term));
  document.querySelector('#vazio').hidden=matches.length>0;
  matches.forEach(loja=>{
    const card=element('article','shop');card.append(element('div','shop-banner','🚲'));
    const body=element('div','shop-body');body.append(element('h3','',loja.nome),element('p','address','📍 '+loja.endereco));
    body.append(element('p','shop-meta',`${loja.produtos.length} produto(s) no catálogo`));
    if(loja.telefone)body.append(element('p','shop-meta','☎ '+loja.telefone));
    const actions=element('div','shop-actions');const view=element('button','btn','Ver catálogo');view.addEventListener('click',()=>showCatalog(loja));actions.append(view);
    const del=element('button','delete','Excluir');del.title='Excluir bicicletaria';del.addEventListener('click',()=>{if(confirm(`Excluir ${loja.nome}?`)){lojas=lojas.filter(x=>x.id!==loja.id);save();render();}});actions.append(del);body.append(actions);card.append(body);lista.append(card);
  });
}
function showCatalog(loja){
  document.querySelector('#dialogTitulo').textContent=loja.nome;
  document.querySelector('#dialogEndereco').textContent=loja.endereco;
  const target=document.querySelector('#dialogProdutos');target.replaceChildren();
  if(!loja.produtos.length){target.append(element('p','muted','Esta bicicletaria ainda não possui produtos cadastrados.'));}
  loja.produtos.forEach(p=>{const item=element('article','catalog-item');item.append(element('h3','',p.nome));if(p.descricao)item.append(element('p','',p.descricao));item.append(element('div','price',p.preco!=='' ? Number(p.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : 'Consulte o preço'));target.append(item);});
  dialog.showModal();
}
document.querySelector('#fecharDialog').addEventListener('click',()=>dialog.close());
busca.addEventListener('input',render);
form.addEventListener('submit',event=>{
  event.preventDefault();
  const fd=new FormData(form);
  const produtos=[...produtosForm.querySelectorAll('.product-row')].map(row=>({nome:row.querySelector('[name="nome"]').value.trim(),preco:row.querySelector('[name="preco"]').value,descricao:row.querySelector('[name="descricao"]').value.trim()})).filter(p=>p.nome);
  const nome=String(fd.get('nome')).trim(),endereco=String(fd.get('endereco')).trim();
  if(!nome||!endereco)return;
  lojas.unshift({id:crypto.randomUUID(),nome,endereco,telefone:String(fd.get('telefone')).trim(),produtos});
  try{save();}catch{document.querySelector('#mensagem').textContent='Não foi possível salvar: armazenamento do navegador indisponível.';return;}
  form.reset();produtosForm.replaceChildren();addProduto();document.querySelector('#mensagem').textContent='Bicicletaria cadastrada com sucesso!';busca.value='';render();document.querySelector('#lojas').scrollIntoView({behavior:'smooth'});
});
addProduto();render();
