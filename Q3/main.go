package main

import (
	"fmt"
)

// find most repeated data by the given array
func mostRepeatedData(dataArr []string) string {

	arrayLength := len(dataArr)

	if arrayLength == 0 {
		return ""
	}

	//using map the frequency of data will be update
	dataTable := make(map[string]int)

	for i := 0; i < arrayLength; i++ {
		data := dataArr[i]
		dataTable[data]++
	}

	//Find most frequent data
	maxFrequency := 0
	var maxData string
	for data, frequency := range dataTable {
		if frequency > maxFrequency {
			maxFrequency = frequency
			maxData = data
		}
	}

	return maxData
}

func main() {
	data := []string{"apple", "pie", "apple", "red", "red", "red"}
	fmt.Println(mostRepeatedData(data))
}
