import {getStore} from '../data/database'
import React, { useState, useEffect } from "react"
import Link from 'next/link'

const TableOfContents = () => {

    const store = getStore();
    const [books, setBooks] = useState(null);

    useEffect(() => {
        async function initialize(){
            await store.ready;
            
            const db = store.db;
            const worker = store.worker;
            
            const results = await worker.db.query(`SELECT * FROM books`);

            if(results.length > 0){
                setBooks(results);
            }
            else{
                setBooks(null);
            }            
        }

        initialize();
    }, []);

    if(books == null){
        return(
            <Link href={`./read/Genesis 1`}>Genesis</Link>
        ) 
    }

    return(
        <ul>
            {books.map((book) => (
                <li key={book.number}>
                    <Link href={`./read/${book.name} 1`}>
                    <a>{book.name}</a>
                    </Link>
                </li>
            ))}
        </ul>
        
    )
}

export default TableOfContents;