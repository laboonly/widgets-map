import React, { useEffect, useState } from 'react';
import style from './index.module.css';




export const Information = React.forwardRef(( info : any, ref: any) => {
	 
	const [list, setList ] = useState<Array<any>>([]);

	const markInfo = info.info;
	
	const [header, setHeader] = useState<string>();


	useEffect(() => {
		let newList: Array<any> = []
		for(let info in markInfo) {
			if(info !== 'location' && info !== '名称') {
				newList.push({text: info, value: markInfo[info]});
			} else if(info === '名称' ) {
				setHeader(markInfo[info]);
			}
		}
		setList([...newList]);
	}, [markInfo]);


	return (
		<div className={style.information} ref={ref} >
			<h2 className={style.header}>{ header }</h2>
			<ul className={style.list}>
				{
					list.map((item , index) => {
						return (
							<li key={index}>{ item.text }: { item.value }</li>
						);
					})
				}
				<li id="commute"  className={style.commuteC}></li>
			</ul>
		</div>
	);
});

