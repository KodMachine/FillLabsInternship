package main

import (
	"fmt"
	"sort"
	"strings"
)

// sortWords : Sorts the given slice of words in descending order by the number of 'a' characters in each word. If there is a tie, it sorts by descending word length.
func sortWords(words []string) {
	sort.Slice(words, func(i, j int) bool {
		countA_i := strings.Count(words[i], "a")
		countA_j := strings.Count(words[j], "a")

		//descending order by de number of "a"
		if countA_i != countA_j {
			return countA_i > countA_j
		}

		//If there is a tie, it sorts by descending word length
		return len(words[i]) > len(words[j])
	})
}

func main() {

	words := []string{
		"a", "aaabbb", "zzzz", "sdgcx", "aaavb", "lllalll", "aaaazzzzz", "aaaa", "abc", "opeoreor",
	}

	sortWords(words)

	fmt.Println(words)
}
