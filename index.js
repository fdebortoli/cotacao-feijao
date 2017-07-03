import { create } from 'rung-sdk';
import { OneOf, Double } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { path, lt, gt, pipe, cond, equals, contains, __, T, concat } from 'ramda';
import { JSDOM } from 'jsdom';

const request = promisifyAgent(agent, Bluebird);

function render(card_titulo, col1_tit, col1_val, col2_tit, col2_val) {

    return (
		<div style="width:165px; height:125px; box-sizing: border-box; padding: 1px; overflow: hidden; position: absolute; margin: -12px 0 0 -10px; ">

			<div style="width:100%; height:20px; background-color: rgba(255,255,255,0.5); position: relative; z-index:1; ">
				<div style="background: url('http://www.pbanimado.com.br/rung/icon-feijao.png') no-repeat center center; background-size: 100%; width:50px; height: 50px; position: absolute; z-index:2; margin: -10px 0 0 54px; border: 3px solid #FFF; -webkit-border-radius: 50%; -moz-border-radius: 50%; border-radius: 50%;"></div>
			</div>

			<div style="font-size:11px; width:96%; line-height: 1.3; text-align: center; padding: 30px 2% 0; ">
				<p style="margin:0; padding: 0; ">{card_titulo}</p>
				<p style="margin:0; padding: 0; ">{col1_tit}: {col1_val}</p>
				<p style="margin:0; padding: 0; ">{col2_tit}: <strong style="text-decoration: underline; ">{col2_val}</strong></p>
			</div>
		</div>
	);


}

function nodeListToArray(dom) {
    return Array.prototype.slice.call(dom, 0);
}

function returnSelector(type, row, cell) {
	const selector = '#content .middle .tables .cotacao:nth-child(1) .table-content table ';
	const selectorTable = type == 'title'
		? `thead > tr > th:nth-child(${cell})`
		: `tbody > tr:nth-child(${row}) > td:nth-child(${cell})`;
	return selector + selectorTable;
}

function main(context, done) {

	const { fonte, condicao, valor } = context.params;

	// variáveis padrão
	var fonte_titulo = '';
	var fonte_link = 'https://www.noticiasagricolas.com.br/cotacoes/feijao/';
	var fonte_data = '#content .middle .tables .cotacao:nth-child(1) .info .fechamento';

	// variáveis das colunas de busca
	var coluna1_titulo = returnSelector('title', '', '1');
	var coluna1_result = returnSelector('result', '1', '1');

	var coluna2_titulo = returnSelector('title', '', '2');
	var coluna2_result = returnSelector('result', '1', '2');

	var coluna3_titulo = returnSelector('title', '', '3');
	var coluna3_result = returnSelector('result', '1', '3');

	// definindo os valores padrão de exibição
	var fonte_coluna_tit 	= coluna1_titulo;
	var fonte_coluna_res 	= coluna1_result;

	var fonte_preco_tit 	= coluna2_titulo;
	var fonte_preco_res 	= coluna2_result;

	var fonte_variacao_tit 	= coluna3_titulo;
	var fonte_variacao_res 	= coluna3_result;

	// definindo o link de conexão
	const server = pipe(
		cond([

			[contains(__, ['Feijão Atacado SP - Carioca 9,5','Feijão Atacado SP - Carioca 9','Feijão Atacado SP - Carioca 8,5','Feijão Atacado SP - Carioca 8','Feijão Atacado SP - Carioca 7,5','Feijão Atacado SP - Carioca 6','Feijão Atacado SP - Preto Extra','Feijão Atacado SP - Preto Especial']), () => 'feijao-atacado-sp'],

			[contains(__, ['Carioca Nota 7 - Bolsa Brás/SP','Carioca Nota 7 - Castro/PR','Carioca Nota 7 - Norte do PR','Carioca Nota 7 - Noroeste de MG','Carioca Nota 7 - Cristalina/GO','Carioca Nota 7 - Rio Verde/GO']), () => 'feijao-carioca-nota-7'],

			[contains(__, ['Carioca nota 8 - Bolsa Brás/SP','Carioca nota 8 - Noroeste de MG','Carioca nota 8 - Cristalina/GO','Carioca nota 8 - Rio Verde/GO','Carioca nota 8 - Itaí/SP','Carioca nota 8 - Taquarituba/SP','Carioca nota 8 - Castro/PR','Carioca nota 8 - Norte do PR','Carioca nota 8 - Sul do PR']), () => 'feijao-carioca-nota-8'],

			[contains(__, ['Carioca nota 8,5 - Bolsa Brás/SP','Carioca nota 8,5 - Noroeste de MG','Carioca nota 8,5 - Cristalina/GO','Carioca nota 8,5 - Rio Verde/GO','Carioca nota 8,5 - Lucas do Rio Verde/MT','Carioca nota 8,5 - Sorriso/MT','Carioca nota 8,5 - Primavera/MT','Carioca nota 8,5 - Itaí/SP','Carioca nota 8,5 - Taquarituba/SP','Carioca nota 8,5 - Castro/PR','Carioca nota 8,5 - Norte do PR','Carioca nota 8,5 - Sul do PR']), () => 'feijao-carioca-nota-8-5'],

			[contains(__, ['Carioca nota 9/9,5 - Bolsa Brás/SP','Carioca nota 9/9,5 - Guaíra/SP','Carioca nota 9/9,5 - Noroeste de MG','Carioca nota 9/9,5 - Cristalina/GO','Carioca nota 9/9,5 - Rio Verde/GO','Carioca nota 9/9,5 - Castro/PR','Carioca nota 9/9,5 - Norte do PR']), () => 'feijao-carioca-nota-9-9-5'],

			[contains(__, ['Caupi Nova Era - Paranaguá/PR','Caupi Nova Era - Lucas do Rio Verde/MT','Caupi Nova Era - Sorriso/MT','Caupi Nova Era - Primavera/MT']), () => 'feijao-caupi-nova-era'],

			[contains(__, ['Feijão Preto - Bolsa Brás/SP','Feijão Preto - Paranaguá/PR','Feijão Preto - Sul Paraná','Feijão Preto - Média Rio Grande do Sul']), () => 'feijao-preto'],

			[contains(__, ['Atacado Média PR - Carioca tipo 1','Atacado Média PR - Preto tipo 1']), () => 'preco-feijo-parana-media'],

			[T, () => '']
		]),
		concat(fonte_link)
	)(fonte);

	// definindo os valores padrão
	switch (fonte) {


		case 'Feijão Atacado SP - Carioca 9,5':
			fonte_titulo		= 'Feijão - Atacado SP';
			break;

		case 'Feijão Atacado SP - Carioca 9':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Feijão Atacado SP - Carioca 8,5':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Feijão Atacado SP - Carioca 8':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Feijão Atacado SP - Carioca 7,5':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Feijão Atacado SP - Carioca 6':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Feijão Atacado SP - Preto Extra':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'Feijão Atacado SP - Preto Especial':
			fonte_titulo		= 'Feijão - Atacado SP';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
			break;



		case 'Carioca Nota 7 - Bolsa Brás/SP':
			fonte_titulo		= 'Feijão Carioca Nota 7';
			break;

		case 'Carioca Nota 7 - Castro/PR':
			fonte_titulo		= 'Feijão Carioca Nota 7';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Carioca Nota 7 - Norte do PR':
			fonte_titulo		= 'Feijão Carioca Nota 7';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Carioca Nota 7 - Noroeste de MG':
			fonte_titulo		= 'Feijão Carioca Nota 7';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Carioca Nota 7 - Cristalina/GO':
			fonte_titulo		= 'Feijão Carioca Nota 7';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Carioca Nota 7 - Rio Verde/GO':
			fonte_titulo		= 'Feijão Carioca Nota 7';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;



		case 'Carioca nota 8 - Bolsa Brás/SP':
			fonte_titulo		= 'Feijão Carioca nota 8';
			break;

		case 'Carioca nota 8 - Noroeste de MG':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Carioca nota 8 - Cristalina/GO':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Carioca nota 8 - Rio Verde/GO':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Carioca nota 8 - Itaí/SP':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Carioca nota 8 - Taquarituba/SP':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Carioca nota 8 - Castro/PR':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'Carioca nota 8 - Norte do PR':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
			break;

		case 'Carioca nota 8 - Sul do PR':
			fonte_titulo		= 'Feijão Carioca nota 8';
			fonte_coluna_res 	= returnSelector('result', '9', '1');
			fonte_preco_res 	= returnSelector('result', '9', '2');
			fonte_variacao_res 	= returnSelector('result', '9', '3');
			break;




		case 'Carioca nota 8,5 - Bolsa Brás/SP':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			break;

		case 'Carioca nota 8,5 - Noroeste de MG':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Carioca nota 8,5 - Cristalina/GO':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Carioca nota 8,5 - Rio Verde/GO':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Carioca nota 8,5 - Lucas do Rio Verde/MT':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Carioca nota 8,5 - Sorriso/MT':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Carioca nota 8,5 - Primavera/MT':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'Carioca nota 8,5 - Itaí/SP':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
			break;

		case 'Carioca nota 8,5 - Taquarituba/SP':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '9', '1');
			fonte_preco_res 	= returnSelector('result', '9', '2');
			fonte_variacao_res 	= returnSelector('result', '9', '3');
			break;

		case 'Carioca nota 8,5 - Castro/PR':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '10', '1');
			fonte_preco_res 	= returnSelector('result', '10', '2');
			fonte_variacao_res 	= returnSelector('result', '10', '3');
			break;

		case 'Carioca nota 8,5 - Norte do PR':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '11', '1');
			fonte_preco_res 	= returnSelector('result', '11', '2');
			fonte_variacao_res 	= returnSelector('result', '11', '3');
			break;

		case 'Carioca nota 8,5 - Sul do PR':
			fonte_titulo		= 'Feijão Carioca nota 8,5';
			fonte_coluna_res 	= returnSelector('result', '12', '1');
			fonte_preco_res 	= returnSelector('result', '12', '2');
			fonte_variacao_res 	= returnSelector('result', '12', '3');
			break;




		case 'Carioca nota 9/9,5 - Bolsa Brás/SP':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			break;

		case 'Carioca nota 9/9,5 - Guaíra/SP':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Carioca nota 9/9,5 - Noroeste de MG':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Carioca nota 9/9,5 - Cristalina/GO':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Carioca nota 9/9,5 - Rio Verde/GO':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Carioca nota 9/9,5 - Castro/PR':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Carioca nota 9/9,5 - Norte do PR':
			fonte_titulo		= 'Feijão Carioca nota 9/9,5';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;




		case 'Caupi Nova Era - Paranaguá/PR':
			fonte_titulo		= 'Feijão Caupi Nova Era';
			break;

		case 'Caupi Nova Era - Lucas do Rio Verde/MT':
			fonte_titulo		= 'Feijão Caupi Nova Era';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Caupi Nova Era - Sorriso/MT':
			fonte_titulo		= 'Feijão Caupi Nova Era';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Caupi Nova Era - Primavera/MT':
			fonte_titulo		= 'Feijão Caupi Nova Era';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;




		case 'Feijão Preto - Bolsa Brás/SP':
			fonte_titulo		= 'Feijão Preto';
			break;

		case 'Feijão Preto - Paranaguá/PR':
			fonte_titulo		= 'Feijão Preto';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Feijão Preto - Sul Paraná':
			fonte_titulo		= 'Feijão Preto';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Feijão Preto - Média Rio Grande do Sul':
			fonte_titulo		= 'Feijão Preto';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;



		case 'Atacado Média PR - Carioca tipo 1':
			fonte_titulo		= 'Feijão Atacado - Média PR';
			break;

		case 'Atacado Média PR - Preto tipo 1':
			fonte_titulo		= 'Feijão Atacado - Média PR';
			break;


	}

	// Obter todo o HTML do site em modo texto
	return request.get(server).then(({ text }) => {

		// Virtualizar o DOM do texto
		const { window } = new JSDOM(text);

		// Converter os dados da tabela para uma lista
		const retorno_data 			= window.document.querySelector(fonte_data).innerHTML;
		const retorno_coluna_tit 	= window.document.querySelector(fonte_coluna_tit).innerHTML;
		const retorno_coluna_res 	= window.document.querySelector(fonte_coluna_res).innerHTML;
		const retorno_preco_tit 	= window.document.querySelector(fonte_preco_tit).innerHTML;
		const retorno_preco_res 	= window.document.querySelector(fonte_preco_res).innerHTML;
		const retorno_variacao_tit 	= window.document.querySelector(fonte_variacao_tit).innerHTML;
		const retorno_variacao_res 	= window.document.querySelector(fonte_variacao_res).innerHTML;

		// arrumando o valor que vem do HTML
		var valorHTML = parseFloat(retorno_preco_res.replace(',', '.'));

		// arrumando o valor que é digitado
		var valorFormatado = valor.toFixed(2);

		// formatando comentario
		var comentario = "<p style='font-weight: bold; font-size: 18px; '>Cotação do Feijão</p><p style='font-weight: bold; font-size: 18px; '>" + fonte_titulo + "</p><hr><p style='font-size: 16px; font-weight: bold; '>" + retorno_data + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_coluna_tit + "</span>: " + retorno_coluna_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_preco_tit + "</span>: " + retorno_preco_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_variacao_tit + "</span>: " + retorno_variacao_res + "</p><br><p style='font-size: 16px; '>Fonte: Portal Notícias Agrícolas</p><a href='" + server + "' target='_blank' style='font-size: 14px; font-style: italic; '>http://www.noticiasagricolas.com.br</a>";

		console.log(comentario);

		// verificação de maior OU menor
		if ((condicao == 'maior' && valorHTML > valor) || (condicao == 'menor' && valorHTML < valor)) {

			done({
				alerts: {
					[`feijao${fonte_titulo}`] : {
						title: fonte_titulo,
						content: render(fonte_titulo, retorno_coluna_tit, retorno_coluna_res, retorno_preco_tit, retorno_preco_res),
						comment: comentario
					}
				}
			});

		} else {

			done({ alerts: {} });

		}
	})
	.catch(() => done({ alerts: {} }));

}

const lista_fontes = [

	'Feijão Atacado SP - Carioca 9,5',
	'Feijão Atacado SP - Carioca 9',
	'Feijão Atacado SP - Carioca 8,5',
	'Feijão Atacado SP - Carioca 8',
	'Feijão Atacado SP - Carioca 7,5',
	'Feijão Atacado SP - Carioca 6',
	'Feijão Atacado SP - Preto Extra',
	'Feijão Atacado SP - Preto Especial',
	'Carioca Nota 7 - Bolsa Brás/SP',
	'Carioca Nota 7 - Castro/PR',
	'Carioca Nota 7 - Norte do PR',
	'Carioca Nota 7 - Noroeste de MG',
	'Carioca Nota 7 - Cristalina/GO',
	'Carioca Nota 7 - Rio Verde/GO',
	'Carioca nota 8 - Bolsa Brás/SP',
	'Carioca nota 8 - Noroeste de MG',
	'Carioca nota 8 - Cristalina/GO',
	'Carioca nota 8 - Rio Verde/GO',
	'Carioca nota 8 - Itaí/SP',
	'Carioca nota 8 - Taquarituba/SP',
	'Carioca nota 8 - Castro/PR',
	'Carioca nota 8 - Norte do PR',
	'Carioca nota 8 - Sul do PR',
	'Carioca nota 8,5 - Bolsa Brás/SP',
	'Carioca nota 8,5 - Noroeste de MG',
	'Carioca nota 8,5 - Cristalina/GO',
	'Carioca nota 8,5 - Rio Verde/GO',
	'Carioca nota 8,5 - Lucas do Rio Verde/MT',
	'Carioca nota 8,5 - Sorriso/MT',
	'Carioca nota 8,5 - Primavera/MT',
	'Carioca nota 8,5 - Itaí/SP',
	'Carioca nota 8,5 - Taquarituba/SP',
	'Carioca nota 8,5 - Castro/PR',
	'Carioca nota 8,5 - Norte do PR',
	'Carioca nota 8,5 - Sul do PR',
	'Carioca nota 9/9,5 - Bolsa Brás/SP',
	'Carioca nota 9/9,5 - Guaíra/SP',
	'Carioca nota 9/9,5 - Noroeste de MG',
	'Carioca nota 9/9,5 - Cristalina/GO',
	'Carioca nota 9/9,5 - Rio Verde/GO',
	'Carioca nota 9/9,5 - Castro/PR',
	'Carioca nota 9/9,5 - Norte do PR',
	'Caupi Nova Era - Paranaguá/PR',
	'Caupi Nova Era - Lucas do Rio Verde/MT',
	'Caupi Nova Era - Sorriso/MT',
	'Caupi Nova Era - Primavera/MT',
	'Feijão Preto - Bolsa Brás/SP',
	'Feijão Preto - Paranaguá/PR',
	'Feijão Preto - Sul Paraná',
	'Feijão Preto - Média Rio Grande do Sul',
	'Atacado Média PR - Carioca tipo 1',
	'Atacado Média PR - Preto tipo 1'

];

const params = {
    fonte: {
        description: _('Informe a fonte que você deseja ser informado: '),
        type: OneOf(lista_fontes),
		required: true
    },
	condicao: {
		description: _('Informe a condição (maior, menor): '),
		type: OneOf(['maior', 'menor']),
		default: 'maior'
	},
	valor: {
		description: _('Informe o valor em reais para verificação: '),
		type: Double,
		required: true
	}
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Cotação Feijão"),
    description: _("Acompanhe a cotação do feijão em diversas praças."),
	preview: render('Feijão - Atacado SP', 'Variedade', 'Carioca 8,5', 'Preço (R$/sc 60kg)', '160,00')
});