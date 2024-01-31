package bleconfig

var crc func(bytes []byte) byte

func init() {
	crc = crc8()
}

func crc8() func(bytes []byte) byte {
	const poly = byte(0x2B) //X5+X3+X1+X0      00101011 0x2B

	var buffer [256]byte
	for i := 0; i < len(buffer); i++ {
		temp := i
		for j := 0; j < 8; j++ {

			if (temp & 0x80) != 0 {
				temp = (temp << 1) ^ int(poly)
			} else {
				temp <<= 1
			}

		}
		buffer[i] = byte(temp)
	}

	return func(bytes []byte) byte {
		crc := byte(0)
		length := len(bytes)

		if length > 0 {
			for i := 0; i < length; i++ {
				crc = buffer[crc^bytes[i]]
			}

		}
		return crc
	}
}
