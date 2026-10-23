import unittest
from audio import make_cues
class Captions(unittest.TestCase):
    def test_real_timestamps(self):
        cues=make_cues('你好世界',[[100,300],[300,500],[900,1100],[1100,1400]],2.5)
        self.assertEqual(cues[0]['start'],2.6)
        self.assertEqual(cues[-1]['end'],3.9)
        self.assertEqual(''.join(c['text'] for c in cues),'你好世界')
    def test_missing_timestamps(self):
        with self.assertRaises(ValueError):make_cues('你好',[],0)
    def test_no_guessed_word_times(self):
        with self.assertRaises(ValueError):make_cues('你好',[[0,100]],0)
if __name__=='__main__':unittest.main()
