import React from 'react';
import style from './index.module.css'


interface Props {
	ref: any,
	title: string,
	address: string,
	info: string,
	price: number,	
	contact: number,
}

export const Information = React.forwardRef(({ title, address, info, price, contact} : Props , ref: any) => {
	 
	return (
		<div className={style.information} ref={ref} >
			<h2 className={style.header}>{ title }</h2>
			<ul className={style.list}>
				<li>地址: { address }</li>
				<li>优缺点: { info }</li>
				<li>价格: ￥{ price }</li>
				<li>联系方式: { contact }</li>
				<li id="commute"  className={style.commuteC}></li>
			</ul>
		</div>
	);
});