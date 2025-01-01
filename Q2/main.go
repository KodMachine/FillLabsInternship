package main

import (
	"fmt"
)

func printIntegerDivision(num int) {

	// end condition
	if num < 2 {
		return
	}

	//find half of the number
	printIntegerDivision(num / 2)

	//when fingding the half ends print numbers
	fmt.Println(num)
}

func main() {
	printIntegerDivision(9)
}
